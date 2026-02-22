"use client";

import * as React from "react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type LoginRequiredModalProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    message?: string;
    loginHref?: string; 
};

export function LoginRequiredModal({
    open,
    onOpenChange,
    message = "You must be logged in to report an artwork.",
    loginHref = "/login",
}: LoginRequiredModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-105 rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-lg">Login required</DialogTitle>
                    <DialogDescription className="text-sm">{message}</DialogDescription>
                </DialogHeader>

                <DialogFooter className="gap-2">
                    <Button variant="outline" className="rounded-xl" onClick={() => onOpenChange(false)} type="button">
                        Cancel
                    </Button>

                    <Button asChild className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white" type="button">
                        <Link href={loginHref} >Log in</Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}