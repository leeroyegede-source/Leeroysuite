import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, PieChart, TrendingUp, Target, Calculator, Plus, X } from "lucide-react";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { systemPrompts } from "@/config/prompts";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

const incomeCategories = ["Salary", "Freelance", "Business", "Investments", "Other"];
const expenseCategories = [
  "Housing", "Food", "Transportation", "Healthcare", "Entertainment",
  "Shopping", "Education", "Savings", "Insurance", "Utilities", "Other"
];

const financialGoals = [
  "Emergency Fund", "House Down Payment", "Vacation", "Car Purchase",
  "Debt Payoff", "Retirement", "Education Fund", "Investment Portfolio"
];

interface IncomeExpense {
  category: string;
  amount: string;
  description: string;
}

export default function FinancePage() {
  const [income, setIncome] = useState<IncomeExpense[]>([{ category: "", amount: "", description: "" }]);
  const [expenses, setExpenses] = useState<IncomeExpense[]>([{ category: "", amount: "", description: "" }]);
  const [financialData, setFinancialData] = useState({
    monthlyIncome: "",
    savingsGoal: "",
    goalCategory: "",
    timeframe: "",
    currentSavings: "",
    financialConcerns: ""
  });
  const [results, setResults] = useState({
    budget: "",
    recommendations: "",
    savingsPlan: ""
  });

  const { toast } = useToast();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const addIncomeItem = () => {
    setIncome([...income, { category: "", amount: "", description: "" }]);
  };

  const addExpenseItem = () => {
    setExpenses([...expenses, { category: "", amount: "", description: "" }]);
  };

  const removeIncomeItem = (index: number) => {
    setIncome(income.filter((_, i) => i !== index));
  };

  const removeExpenseItem = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const updateIncomeItem = (index: number, field: keyof IncomeExpense, value: string) => {
    const newIncome = [...income];
    newIncome[index][field] = value;
    setIncome(newIncome);
  };

  const updateExpenseItem = (index: number, field: keyof IncomeExpense, value: string) => {
    const newExpenses = [...expenses];
    newExpenses[index][field] = value;
    setExpenses(newExpenses);
  };

  const handleInputChange = (field: string, value: string) => {
    setFinancialData(prev => ({ ...prev, [field]: value }));
  };

  const generateFinancialPlan = async () => {
    const validIncome = income.filter(item => item.category && item.amount);
    const validExpenses = expenses.filter(item => item.category && item.amount);

    if (validIncome.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please add at least one income source.",
        variant: "destructive"
      });
      return;
    }

    try {
      const incomeTotal = validIncome.reduce((sum, item) => sum + parseFloat(item.amount || "0"), 0);
      const expenseTotal = validExpenses.reduce((sum, item) => sum + parseFloat(item.amount || "0"), 0);

      const prompt = `Create a comprehensive personal finance plan with the following information:

INCOME (Monthly):
${validIncome.map(item => `- ${item.category}: $${item.amount} (${item.description})`).join('\n')}
Total Monthly Income: $${incomeTotal}

EXPENSES (Monthly):
${validExpenses.map(item => `- ${item.category}: $${item.amount} (${item.description})`).join('\n')}
Total Monthly Expenses: $${expenseTotal}

FINANCIAL GOALS:
- Savings Goal: $${financialData.savingsGoal || "Not specified"}
- Goal Type: ${financialData.goalCategory || "General savings"}
- Timeframe: ${financialData.timeframe || "Not specified"}
- Current Savings: $${financialData.currentSavings || "0"}
- Financial Concerns: ${financialData.financialConcerns || "None specified"}

Please provide:
1. BUDGET ANALYSIS: Income vs expenses breakdown with recommendations
2. SAVINGS PLAN: How to reach the savings goal within the timeframe
3. FINANCIAL RECOMMENDATIONS: Specific advice for improving financial health
4. EXPENSE OPTIMIZATION: Areas where spending can be reduced
5. INVESTMENT SUGGESTIONS: Based on available surplus

Make it practical and actionable.`;

      const response = await generateStream(systemPrompts.writer, prompt, undefined, undefined, 'finance');

      // Simple parsing for better display
      const sections = response.text.split(/\d+\.\s*[A-Z\s]+:/);

      setResults({
        budget: sections[1] || response.text,
        recommendations: sections[2] || "",
        savingsPlan: sections[3] || ""
      });

      toast({
        title: "Financial Plan Generated!",
        description: "Your personalized financial plan is ready."
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const totalIncome = income.reduce((sum, item) => sum + parseFloat(item.amount || "0"), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.amount || "0"), 0);
  const netIncome = totalIncome - totalExpenses;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <DollarSign className="w-8 h-8 text-ai-primary" />
          <h1 className="text-3xl font-bold ai-gradient-text">AI Personal Finance Helper</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create personalized budget plans and achieve your financial goals with AI-powered insights
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="ai-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-xl font-bold text-green-500">${totalIncome.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="ai-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-xl font-bold text-red-500">${totalExpenses.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="ai-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-ai-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Net Income</p>
                <p className={`text-xl font-bold ${netIncome >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${netIncome.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-6">
          <Tabs defaultValue="income" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
            </TabsList>

            <TabsContent value="income">
              <Card className="ai-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Monthly Income Sources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {income.map((item, index) => (
                    <div key={index} className="space-y-2 p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Income Source {index + 1}</h4>
                        {income.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeIncomeItem(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={item.category}
                          onValueChange={(value) => updateIncomeItem(index, "category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {incomeCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => updateIncomeItem(index, "amount", e.target.value)}
                        />
                      </div>
                      <Input
                        placeholder="Description (optional)"
                        value={item.description}
                        onChange={(e) => updateIncomeItem(index, "description", e.target.value)}
                      />
                    </div>
                  ))}
                  <Button variant="outline" onClick={addIncomeItem} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Income Source
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="expenses">
              <Card className="ai-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Monthly Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {expenses.map((item, index) => (
                    <div key={index} className="space-y-2 p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">Expense {index + 1}</h4>
                        {expenses.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExpenseItem(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Select
                          value={item.category}
                          onValueChange={(value) => updateExpenseItem(index, "category", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Category" />
                          </SelectTrigger>
                          <SelectContent>
                            {expenseCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={item.amount}
                          onChange={(e) => updateExpenseItem(index, "amount", e.target.value)}
                        />
                      </div>
                      <Input
                        placeholder="Description (optional)"
                        value={item.description}
                        onChange={(e) => updateExpenseItem(index, "description", e.target.value)}
                      />
                    </div>
                  ))}
                  <Button variant="outline" onClick={addExpenseItem} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Expense
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="goals">
              <Card className="ai-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Financial Goals
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="savingsGoal">Savings Goal Amount</Label>
                      <Input
                        id="savingsGoal"
                        type="number"
                        value={financialData.savingsGoal}
                        onChange={(e) => handleInputChange("savingsGoal", e.target.value)}
                        placeholder="10000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="goalCategory">Goal Type</Label>
                      <Select value={financialData.goalCategory} onValueChange={(value) => handleInputChange("goalCategory", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select goal type" />
                        </SelectTrigger>
                        <SelectContent>
                          {financialGoals.map((goal) => (
                            <SelectItem key={goal} value={goal}>
                              {goal}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="timeframe">Timeframe</Label>
                      <Input
                        id="timeframe"
                        value={financialData.timeframe}
                        onChange={(e) => handleInputChange("timeframe", e.target.value)}
                        placeholder="12 months"
                      />
                    </div>
                    <div>
                      <Label htmlFor="currentSavings">Current Savings</Label>
                      <Input
                        id="currentSavings"
                        type="number"
                        value={financialData.currentSavings}
                        onChange={(e) => handleInputChange("currentSavings", e.target.value)}
                        placeholder="2000"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="financialConcerns">Financial Concerns/Questions</Label>
                    <Textarea
                      id="financialConcerns"
                      value={financialData.financialConcerns}
                      onChange={(e) => handleInputChange("financialConcerns", e.target.value)}
                      placeholder="Debt management, investment advice, budget optimization..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Button
            onClick={generateFinancialPlan}
            disabled={isStreaming}
            className="w-full"
            size="lg"
          >
            {isStreaming ? "Analyzing Finances..." : "Generate Financial Plan"}
          </Button>
        </div>

        {/* Output Section */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Your Financial Plan
            </CardTitle>
            <CardDescription>
              AI-powered insights and recommendations
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
                {(isStreaming ? streamedText : results.budget) ? (
                  <>
                    <TabsContent value="preview" className="mt-0 h-full">
                      <MarkdownRenderer content={isStreaming ? streamedText : results.budget} />

                      {!isStreaming && (
                        <div className="mt-4 pt-4 border-t">
                          {netIncome >= 0 ? (
                            <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">
                              ✓ Positive Cash Flow
                            </Badge>
                          ) : (
                            <Badge className="bg-red-500/20 text-red-700 dark:text-red-300">
                              ⚠️ Budget Deficit
                            </Badge>
                          )}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="edit" className="mt-0 h-full">
                      <Textarea
                        value={isStreaming ? streamedText : results.budget}
                        onChange={(e) => setResults(prev => ({ ...prev, budget: e.target.value }))}
                        className="h-full resize-none border-0 focus-visible:ring-0 p-0"
                        readOnly={isStreaming}
                      />
                    </TabsContent>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Your financial plan will appear here</p>
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
