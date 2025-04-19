import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIGeneratorTab } from "./AIGeneratorTab";
import { ManualCreatorTab } from "./ManualCreatorTab";
import { ResultsList } from "./ResultsList";
import { useFlashcards } from "@/components/hooks/useFlashcards";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const CreatorSection = () => {
  const {
    flashcards,
    isLoading,
    error,
    pagination,
    generateFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    loadPage,
  } = useFlashcards();
  const [activeTab, setActiveTab] = useState<"ai" | "manual">("ai");

  const handleTabChange = (value: string) => {
    setActiveTab(value as "ai" | "manual");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="ai">Generator AI</TabsTrigger>
          <TabsTrigger value="manual">Tworzenie ręczne</TabsTrigger>
        </TabsList>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}

        <TabsContent value="ai">
          <AIGeneratorTab onGenerate={generateFlashcards} isGenerating={isLoading} />
        </TabsContent>

        <TabsContent value="manual">
          <ManualCreatorTab onAdd={createFlashcard} isAdding={isLoading} />
        </TabsContent>

        <div className="mt-8">
          <ResultsList
            flashcards={flashcards}
            pagination={pagination}
            onEdit={updateFlashcard}
            onDelete={deleteFlashcard}
            onPageChange={loadPage}
          />
        </div>
      </Tabs>
    </div>
  );
};
