import { RecipeForm } from "@/components/recipe/RecipeForm";

export default function GenerateRecipe() {
  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Gerar Receita</h1>
          <p className="text-muted-foreground mt-1">
            Preencha as informações abaixo para criar uma nova prescrição médica
          </p>
        </div>

        <RecipeForm />
      </div>
    </div>
  );
}
