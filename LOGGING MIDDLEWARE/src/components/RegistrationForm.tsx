import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Shield, User, Mail, Phone, Github } from "lucide-react";
import { apiService, type RegistrationData } from "@/lib/api-service";
import { logger } from "@/lib/logging-middleware";

interface RegistrationFormProps {
  onRegistrationSuccess: (credentials: any) => void;
}

export const RegistrationForm = ({ onRegistrationSuccess }: RegistrationFormProps) => {
  const [formData, setFormData] = useState<RegistrationData>({
    email: "",
    name: "",
    mobileNo: "",
    githubUsername: "",
    rollNo: "",
    accessCode: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await logger.logUserAction("Registration attempt", formData.email);
      
      const result = await apiService.register(formData);
      
      if (result.success && result.data) {
        await logger.logUserAction("Registration successful", formData.email);
        onRegistrationSuccess(result.data);
      } else {
        setError(result.error || "Registration failed");
        await logger.error("frontend", "api", `Registration failed: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Registration failed";
      setError(errorMessage);
      await logger.error("frontend", "api", `Registration error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof RegistrationData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-medium">
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-primary rounded-full">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          Affordmed Registration
        </CardTitle>
        <p className="text-muted-foreground">
          Register for the Medical Technology Evaluation Service
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange("name")}
                required
                placeholder="Enter your full name"
                className="transition-smooth focus:shadow-soft"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange("email")}
                required
                placeholder="your.email@university.edu"
                className="transition-smooth focus:shadow-soft"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mobileNo" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Mobile Number
              </Label>
              <Input
                id="mobileNo"
                value={formData.mobileNo}
                onChange={handleInputChange("mobileNo")}
                required
                placeholder="9999999999"
                className="transition-smooth focus:shadow-soft"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rollNo" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Roll Number
              </Label>
              <Input
                id="rollNo"
                value={formData.rollNo}
                onChange={handleInputChange("rollNo")}
                required
                placeholder="Your university roll number"
                className="transition-smooth focus:shadow-soft"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="githubUsername" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub Username
              </Label>
              <Input
                id="githubUsername"
                value={formData.githubUsername}
                onChange={handleInputChange("githubUsername")}
                required
                placeholder="your-github-username"
                className="transition-smooth focus:shadow-soft"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="accessCode" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Access Code
              </Label>
              <Input
                id="accessCode"
                value={formData.accessCode}
                onChange={handleInputChange("accessCode")}
                required
                placeholder="Provided access code"
                className="transition-smooth focus:shadow-soft"
              />
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-primary hover:shadow-medium transition-spring"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              "Register for Evaluation"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};