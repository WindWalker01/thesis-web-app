"use client";

import { memo, useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ComparisonViewerProps {
  c_secure_url: string | null;
  best_url: string | null;
  hasScan: boolean;
}

export const ComparisonViewer = memo(function ComparisonViewer({
  c_secure_url,
  best_url,
  hasScan,
}: ComparisonViewerProps) {
  const [activeTab, setActiveTab] = useState("split");

  const isValidUrl = (url: string | null): url is string =>
    !!url && (url.startsWith("http://") || url.startsWith("https://"));

  const canCompare = isValidUrl(c_secure_url) && isValidUrl(best_url);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Side-by-side Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8">
            <TabsTrigger value="split" className="text-xs">Split View</TabsTrigger>
            <TabsTrigger value="slider" className="text-xs">Slider</TabsTrigger>
            <TabsTrigger value="overlay" className="text-xs">Overlay</TabsTrigger>
          </TabsList>
          {activeTab === "split" && (
            <TabsContent value="split" className="mt-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="aspect-square rounded-lg border bg-muted overflow-hidden relative">
                  {isValidUrl(c_secure_url) ? (
                    <Image
                      src={c_secure_url!}
                      alt="Current artwork"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px]">
                    Submitted
                  </div>
                </div>
                <div className="aspect-square rounded-lg border bg-muted overflow-hidden relative">
                  {canCompare ? (
                    <Image
                      src={best_url!}
                      alt="Matched artwork"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute bottom-1 left-1 rounded bg-background/80 px-1.5 py-0.5 text-[10px]">
                    Match
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
          {activeTab === "slider" && (
            <TabsContent value="slider" className="mt-3">
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Drag the slider to compare</p>
              </div>
            </TabsContent>
          )}
          {activeTab === "overlay" && (
            <TabsContent value="overlay" className="mt-3">
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Opacity overlay comparison</p>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
});