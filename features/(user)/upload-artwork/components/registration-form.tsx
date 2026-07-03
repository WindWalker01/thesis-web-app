"use client";

import Link from "next/link";
import type { UseFormReturn } from "react-hook-form";
import { AlertTriangle, CloudUpload, Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { StatusProgress } from "@/features/(user)/upload-artwork/components/status-progress";
import type { UploadArtworkFormValues } from "@/features/(user)/upload-artwork/schemas/artwork-schema";

type RegistrationFormProps = {
  form: UseFormReturn<UploadArtworkFormValues>;
  watchedTitle: string;
  watchedDescription: string;
  completion: number;
  isSubmitting: boolean;
  onSubmit: (values: UploadArtworkFormValues) => void;
};

/**
 * Registration details card: title, description, rights-confirmation, form
 * completion progress, and the submit/cancel actions.
 */
export function RegistrationForm({
  form,
  watchedTitle,
  watchedDescription,
  completion,
  isSubmitting,
  onSubmit,
}: RegistrationFormProps) {
  return (
    <Card>
      <CardHeader className="bg-muted/30 border-b">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary h-5 w-5" />
          Registration details
        </CardTitle>
        <CardDescription>
          Only the required user-provided fields are collected here. Hashes,
          duplicate checks, classification, storage, and blockchain recording
          happen in your backend flow.
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 p-6">
            {form.formState.errors.root?.message && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Registration failed</AlertTitle>
                <AlertDescription>
                  {form.formState.errors.root.message}
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artwork title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Starry Night Reimagined"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <div className="flex items-center justify-end">
                    <span className="text-muted-foreground text-sm">
                      {watchedTitle.length}/120
                    </span>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={7}
                      placeholder="Describe the artwork, concept, inspiration, medium, or context."
                      {...field}
                    />
                  </FormControl>
                  <div className="flex items-center justify-end">
                    <span className="text-muted-foreground text-sm">
                      {watchedDescription.length}/1000
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rightsConfirmed"
              render={({ field }) => (
                <FormItem className="rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(Boolean(checked))
                        }
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-base leading-none">
                        I confirm that I own this artwork or I am authorized to
                        register it.
                      </FormLabel>
                      <FormDescription>
                        This is not necessarily stored in the table, but it is
                        important for the submission flow.
                      </FormDescription>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <StatusProgress
              value={completion}
              label="Form completion"
              className="max-w-full"
            />
          </CardContent>

          <CardFooter className="bg-muted/20 flex flex-col gap-3 border-t p-6 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              asChild
              className="w-full sm:w-auto"
            >
              <Link href="/">Cancel</Link>
            </Button>

            <Button
              type="submit"
              className="w-full sm:flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting registration...
                </>
              ) : (
                <>
                  <CloudUpload className="mr-2 h-4 w-4" />
                  Publish & Protect
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
