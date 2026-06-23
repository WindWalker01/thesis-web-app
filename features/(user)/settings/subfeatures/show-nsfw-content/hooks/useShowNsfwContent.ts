"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import {
    getShowNsfwContentAction,
    updateShowNsfwContentAction,
} from "../server/show-nsfw-content";

export function useShowNsfwContent() {
    const [showNsfwContent, setShowNsfwContent] = useState(false);
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        (async () => {
            const value = await getShowNsfwContentAction();
            setShowNsfwContent(value);
        })();
    }, []);

    function togglePreference(value: boolean) {
        const previous = showNsfwContent;

        setShowNsfwContent(value);

        startTransition(async () => {
            const result = await updateShowNsfwContentAction({
                showNsfwContent: value,
            });

            if (!result.success) {
                setShowNsfwContent(previous);
                toast.error(result.message);
                return;
            }

            toast.success(result.message);
        });
    }

    return {
        showNsfwContent,
        togglePreference,
        isPending,
    };
}