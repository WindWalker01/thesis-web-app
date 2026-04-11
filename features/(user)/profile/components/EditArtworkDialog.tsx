"use client";

import { Loader2, Save } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import type { UseFormReturn } from "react-hook-form";
import type { EditArtworkFormValues } from "../schemas/edit-artwork-schema";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    form: UseFormReturn<EditArtworkFormValues>;
    isSaving: boolean;
    onSubmit: (values: EditArtworkFormValues) => Promise<void>;
};

export function EditArtworkDialog({
    open,
    onOpenChange,
    form,
    isSaving,
    onSubmit,
}: Props) {
    const descriptionValue = form.watch("description") ?? "";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-3xl sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Edit artwork</DialogTitle>
                    <DialogDescription>
                        Only the title and description can be updated for eligible artworks.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-5"
                    >
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter artwork title"
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
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            rows={5}
                                            placeholder="Add a short description"
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <div className="flex items-center justify-between">
                                        <FormMessage />
                                        <span className="ml-auto text-xs text-muted-foreground">
                                            {descriptionValue.length}/1000
                                        </span>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {form.formState.errors.root?.message ? (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.root.message}
                            </p>
                        ) : null}

                        <DialogFooter className="gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>

                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save changes
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}