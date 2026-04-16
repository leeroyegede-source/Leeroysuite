import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, Users, Plus, X, Utensils } from "lucide-react";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { systemPrompts } from "@/config/prompts";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const cuisineTypes = [
  "Italian", "Mexican", "Asian", "Mediterranean", "American", "French",
  "Indian", "Thai", "Japanese", "Greek", "Spanish", "Middle Eastern"
];

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack", "Dessert", "Appetizer"];
const difficulties = ["Easy", "Medium", "Hard"];
const dietaryRestrictions = [
  "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo", "Low-Carb", "Low-Fat"
];

export default function RecipePage() {
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [formData, setFormData] = useState({
    cuisine: "",
    mealType: "",
    difficulty: "",
    cookingTime: "",
    servings: "",
    dietary: "",
    preferences: ""
  });
  const [recipe, setRecipe] = useState("");

  const { toast } = useToast();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const addIngredient = () => {
    setIngredients([...ingredients, ""]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateRecipe = async () => {
    const validIngredients = ingredients.filter(ing => ing.trim() !== "");

    if (validIngredients.length === 0) {
      toast({
        title: "Missing Ingredients",
        description: "Please add at least one ingredient.",
        variant: "destructive"
      });
      return;
    }

    try {
      const prompt = `Create a detailed recipe using these ingredients:
Main ingredients: ${validIngredients.join(", ")}

Preferences:
- Cuisine: ${formData.cuisine || "Any"}
- Meal Type: ${formData.mealType || "Any"}
- Difficulty: ${formData.difficulty || "Any"}
- Cooking Time: ${formData.cookingTime || "No preference"}
- Servings: ${formData.servings || "4"}
- Dietary Restrictions: ${formData.dietary || "None"}
- Special Notes: ${formData.preferences}

Please provide:
1. Recipe name
2. Full ingredients list with quantities
3. Step-by-step cooking instructions
4. Cooking time and difficulty
5. Nutritional highlights
6. Tips for best results

Make it clear, detailed, and easy to follow.`;

      const response = await generateStream(systemPrompts.writer, prompt, undefined, undefined, 'recipe');
      setRecipe(response.text);

      toast({
        title: "Recipe Generated!",
        description: "Your personalized recipe is ready to cook."
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <ChefHat className="w-8 h-8 text-ai-primary" />
          <h1 className="text-3xl font-bold ai-gradient-text">AI Recipe Generator</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transform your available ingredients into delicious recipes with AI-powered cooking assistance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="w-5 h-5" />
              Recipe Preferences
            </CardTitle>
            <CardDescription>
              Tell us what you have and what you'd like to cook
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Ingredients Section */}
            <div>
              <Label className="text-base font-semibold">Available Ingredients *</Label>
              <div className="space-y-2 mt-2">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={ingredient}
                      onChange={(e) => updateIngredient(index, e.target.value)}
                      placeholder="e.g., chicken breast, tomatoes, garlic..."
                      className="flex-1"
                    />
                    {ingredients.length > 1 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeIngredient(index)}
                        className="shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={addIngredient}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cuisine">Cuisine Type</Label>
                <Select value={formData.cuisine} onValueChange={(value) => handleInputChange("cuisine", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuisineTypes.map((cuisine) => (
                      <SelectItem key={cuisine} value={cuisine}>
                        {cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mealType">Meal Type</Label>
                <Select value={formData.mealType} onValueChange={(value) => handleInputChange("mealType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any meal" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((meal) => (
                      <SelectItem key={meal} value={meal}>
                        {meal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={formData.difficulty} onValueChange={(value) => handleInputChange("difficulty", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((diff) => (
                      <SelectItem key={diff} value={diff}>
                        {diff}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="cookingTime">Max Time</Label>
                <Input
                  id="cookingTime"
                  value={formData.cookingTime}
                  onChange={(e) => handleInputChange("cookingTime", e.target.value)}
                  placeholder="30 mins"
                />
              </div>

              <div>
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  value={formData.servings}
                  onChange={(e) => handleInputChange("servings", e.target.value)}
                  placeholder="4"
                  type="number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dietary">Dietary Restrictions</Label>
              <Select value={formData.dietary} onValueChange={(value) => handleInputChange("dietary", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {dietaryRestrictions.map((diet) => (
                    <SelectItem key={diet} value={diet}>
                      {diet}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preferences">Special Preferences</Label>
              <Textarea
                id="preferences"
                value={formData.preferences}
                onChange={(e) => handleInputChange("preferences", e.target.value)}
                placeholder="Any special requests? Spicy food, comfort food, healthy options..."
                rows={2}
              />
            </div>

            <Button
              onClick={generateRecipe}
              disabled={isStreaming}
              className="w-full"
            >
              {isStreaming ? "Creating Recipe..." : "Generate Recipe"}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="ai-card flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-ai-secondary" />
              Generated Recipe
            </CardTitle>
            <CardDescription>
              Your personalized recipe based on available ingredients
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <Tabs defaultValue="preview" className="flex-1 flex flex-col">
              <div className="flex justify-end mb-2">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 min-h-[400px] border rounded-md p-4 bg-background overflow-auto">
                {(isStreaming ? streamedText : recipe) ? (
                  <>
                    <TabsContent value="preview" className="mt-0 h-full">
                      <MarkdownRenderer content={isStreaming ? streamedText : recipe} />
                      {!isStreaming && (
                        <div className="mt-4 flex gap-2 flex-wrap">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formData.cookingTime || "Variable"} time
                          </Badge>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {formData.servings || "4"} servings
                          </Badge>
                          {formData.difficulty && (
                            <Badge variant="secondary">
                              {formData.difficulty} difficulty
                            </Badge>
                          )}
                          {formData.dietary && (
                            <Badge variant="secondary">
                              {formData.dietary}
                            </Badge>
                          )}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="edit" className="mt-0 h-full">
                      <Textarea
                        value={isStreaming ? streamedText : recipe}
                        onChange={(e) => setRecipe(e.target.value)}
                        className="h-full resize-none border-0 focus-visible:ring-0 p-0"
                        readOnly={isStreaming}
                      />
                    </TabsContent>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <ChefHat className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Your personalized recipe will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
