import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form.tsx';
import { Input } from '../ui/input.tsx';
import { Button } from '../ui/button.tsx';
import { Textarea } from '../ui/textarea.tsx';
import CurrencyInput from 'react-currency-input-field';
import { useAuthContext } from '@/context/auth-context.tsx';
import { createProject } from '@/lib/eth/campaignFactory.ts';
import { useMutation } from '@tanstack/react-query';
import { uploadFile } from '@/lib/ipfs/upload.ts';
import { toast } from '@/hooks/use-toast.ts';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge.tsx';
import { Separator } from '@/components/ui/separator.tsx';
import { MilestoneIcon, Text, XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoadingIcon } from '@/components/ui/loading-icon.tsx';

export const MS_DECIMAL_LIMIT = 6;

const newProjectFormSchema = z.object({
  name: z.string().min(2, {
    message: 'The project name should at least be 2 characters.',
  }),
  description: z.string(),
  milestones: z
    .array(
      z.object({
        name: z.string().min(2, {
          message: 'The milestone name should at least be 2 characters.',
        }),
        description: z.string(),
        goal: z.string().refine(
          (value) => {
            const parsedValue = parseFloat(value);
            return (
              !isNaN(parsedValue) && parsedValue > 10 ** (-1 * MS_DECIMAL_LIMIT)
            );
          },
          {
            message: `The milestone goal must be a number greater than ${10 ** (-1 * MS_DECIMAL_LIMIT)}`,
          }
        ),
      })
    )
    .min(1, { message: 'The project should have at least 1 milestone' }),
});

type newProjectFormType = z.infer<typeof newProjectFormSchema>;

export default function NewProjectForm() {
  const { web3, userAcc } = useAuthContext();
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const form = useForm<newProjectFormType>({
    resolver: zodResolver(newProjectFormSchema),
    defaultValues: {
      name: '',
      description: '',
      milestones: [
        {
          name: '',
          description: '',
          goal: '',
        },
      ],
    },
  });

  const uploadMutation = useMutation({
    mutationFn: () => uploadFile(file),
    onError: (err) => {
      toast({
        variant: 'destructive',
        description: `Error uploading file: ${err}`,
      });
    },
  });

  const {
    fields: milestoneFields,
    append: appendMilestone,
    remove: removeMilestone,
  } = useFieldArray({
    name: 'milestones',
    control: form.control,
  });

  const createProjectMutation = useMutation({
    mutationFn: async (values: newProjectFormType) => {
      let imageCid = '';
      if (file) {
        const uploadResult = await uploadMutation.mutateAsync();
        imageCid = uploadResult.cid;
      }

      if (web3 && userAcc) {
        const milestoneNames = values.milestones.map(({ name }) => name);
        const milestoneDescriptions = values.milestones.map(
          ({ description }) => description
        );
        const milestoneGoals = values.milestones.map(({ goal }) => {
          return web3.utils.toWei(goal, 'ether');
        });

        await createProject(
          web3,
          userAcc,
          values.name,
          values.description,
          imageCid,
          milestoneNames,
          milestoneDescriptions,
          milestoneGoals
        );
      }
    },
    onError: (err) => {
      toast({
        variant: 'destructive',
        title: 'Unexpected Error Occurred 😰',
        description: `Error creating project: ${err}`,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: `Project created successfully!`,
      });
      navigate(`/`);
    },
  });

  async function onSubmit(values: newProjectFormType) {
    createProjectMutation.mutate(values);
  }

  return (
    <div className="text-left">
      <Form {...form}>
        <div className="flex py-2 text-md items-center gap-2 text-primary">
          <Badge className="text-md">Step 1</Badge>
          <p className="font-semibold">Project Details</p>
          <Text className="size-6" />
        </div>
        <Separator className="mt-2 mb-4" />
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="rounded-2xl bg-muted/70 p-6 space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your project name here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your project description here"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem className="flex flex-col">
              <FormLabel>Project Image</FormLabel>
              <Input
                type="file"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  setFile(selectedFile || null);
                }}
                accept="image/*"
              />
              {file && (
                <div className="mt-2">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="Selected file preview"
                    className="mt-2 max-w-xs rounded shadow"
                  />
                </div>
              )}
              {uploadMutation.isPending && <p>Uploading image...</p>}
            </FormItem>
          </div>
          <div>
            <div className="flex justify-between">
              <div className="flex py-2 text-md items-center gap-2 text-primary">
                <Badge className="text-md">Step 2</Badge>
                <p className="font-semibold">Milestones</p>
                <MilestoneIcon className="size-6" />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  appendMilestone({ name: '', goal: '', description: '' });
                }}
              >
                New Milestone
              </Button>
            </div>
            <Separator className="mt-2 mb-4" />
            <div className="space-y-4">
              {milestoneFields.map((field, index) => {
                return (
                  <div
                    key={field.id}
                    className="space-y-6 rounded-2xl bg-muted/70 p-6 relative"
                  >
                    <FormField
                      control={form.control}
                      name={`milestones.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Milestone Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your milestone name here"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`milestones.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Milestone Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your milestone desctription here"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`milestones.${index}.goal`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Milestone Goal</FormLabel>
                          <FormControl>
                            <div className="flex items-center gap-3">
                              <p className="font-semibold">ETH</p>
                              <CurrencyInput
                                className="flex h-9 w-full rounded-2xl border border-input bg-white px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                                placeholder="Enter your milestone goal here"
                                decimalsLimit={MS_DECIMAL_LIMIT}
                                value={field.value}
                                onValueChange={(value) => {
                                  field.onChange(value);
                                }}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      className="mt-4 rounded-full min-w-0 min-h-0 size-6 p-1 absolute top-0 -translate-y-2 right-4"
                      onClick={() => removeMilestone(index)}
                    >
                      <XIcon className="size-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex w-full justify-end">
            <Button disabled={createProjectMutation.isPending} type="submit">
              {createProjectMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <LoadingIcon />
                  Kickstarting... 🚀
                </div>
              ) : (
                'Kickstart Project'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
