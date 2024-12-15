import { useForm } from 'react-hook-form';
import { useAuthContext } from '../context/auth-context.tsx';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from './ui/form.tsx';
import { Input } from './ui/input.tsx';
import { Button } from './ui/button.tsx';
import { Textarea } from './ui/textarea.tsx';

const newProjectFormSchema = z.object({
  name: z.string().min(2, {
    message: "The project name should at least be 2 characters.",
  }),
  description: z.string(),
})

type newProjectFormType = z.infer<typeof newProjectFormSchema>;

export default function NewProjectPage() {
  const { userAcc } = useAuthContext();

  const form = useForm<newProjectFormType>({
    resolver: zodResolver(newProjectFormSchema),
    defaultValues: {
      name: '',
      description: '',
    }
  })

  function onSubmit(values: newProjectFormType) {
    console.log(values)
  }

  return (
    <div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your project name here" {...field} />
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
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter your project description here" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Submit</Button>
        </form>
      </Form>
    </div>
  );
}
