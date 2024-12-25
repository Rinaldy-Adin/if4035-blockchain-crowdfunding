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
} from './ui/form.tsx';
import { Input } from './ui/input.tsx';
import { Button } from './ui/button.tsx';
import { Textarea } from './ui/textarea.tsx';
import CurrencyInput from 'react-currency-input-field';
import { cn } from '@/lib/utils.ts';
import { useAuthContext } from '@/context/auth-context.tsx';
import {
  createProject,
  getDeployedProjects,
} from '@/lib/eth/campaignFactory.ts';
import { useMutation } from '@tanstack/react-query';
import { uploadFile } from '@/lib/ipfs/upload.ts';
import { toast } from '@/hooks/use-toast.ts';
import { useState } from 'react';

const MS_DECIMAL_LIMIT = 6;

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

export default function NewProjectPage() {
  const { web3, userAcc } = useAuthContext();
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<newProjectFormType>({
    resolver: zodResolver(newProjectFormSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const uploadMutation = useMutation({
    mutationFn: () => uploadFile(file),
    onError: (err) => {
      toast({
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

  async function onSubmit(values: newProjectFormType) {
    let imageCid = '';
    if (file) {
      const uploadResult = await uploadMutation.mutateAsync(file);
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
  }

  async function onButtonTestClick() {
    if (web3) {
      const campaignAdresses = await getDeployedProjects(web3);
      console.log(campaignAdresses);
    }
  }

  return (
    <div className="text-left">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
          <div>
            <div className="flex justify-between">
              <p
                className={cn(
                  'font-semibold',
                  form.formState.errors.milestones && 'text-destructive'
                )}
              >
                Milestones
              </p>
              <Button
                type="button"
                onClick={() => {
                  appendMilestone({ name: '', goal: '', description: '' });
                }}
              >
                New Milestone
              </Button>
            </div>
            {form.formState.errors.milestones && (
              <p className="text-[0.8rem] font-medium text-destructive">
                {form.formState.errors.milestones.message}
              </p>
            )}

            <div className="space-y-6">
              {milestoneFields.map((field, index) => {
                return (
                  <div key={field.id}>
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
                                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
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
                      className="mt-4"
                      onClick={() => removeMilestone(index)}
                    >
                      Remove Milestone
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
          <Button type="submit">Submit</Button>
        </form>
      </Form>
      <Button type="button" onClick={onButtonTestClick}>
        Test
      </Button>
    </div>
  );
}
