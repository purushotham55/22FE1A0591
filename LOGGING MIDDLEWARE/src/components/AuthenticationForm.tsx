import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, User, Shield, Key } from "lucide-react";
import { apiService, type AuthData } from "@/lib/api-service";
import { logger } from "@/lib/logging-middleware";

interface AuthenticationFormProps {
  credentials: any;
  onAuthSuccess: (token: string) => void;
}

export const AuthenticationForm = ({ credentials, onAuthSuccess }: AuthenticationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAuthenticate = async () => {
    setIsLoading(true);
    setError("");

    try {
      const authData: AuthData = {
        email: credentials.email,
        name: credentials.name,
        rollNo: credentials.rollNo,
        accessCode: credentials.accessCode,
        clientID: credentials.clientID,
        clientSecret: credentials.clientSecret,
      };

      await logger.logUserAction("Authentication attempt", credentials.email);
      
      const result = await apiService.authenticate(authData);
      
      if (result.success && result.data) {
        await logger.logUserAction("Authentication successful", credentials.email);
        onAuthSuccess(result.data.access_token);
      } else {
        setError(result.error || "Authentication failed");
        await logger.error("frontend", "api", `Authentication failed: ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      setError(errorMessage);
      await logger.error("frontend", "api", `Authentication error: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-medium">
      <CardHeader className="space-y-1 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-gradient-accent rounded-full">
            <Lock className="h-8 w-8 text-accent-foreground" />
          </div>
        </div>
        <CardTitle className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">
          Authentication
        </CardTitle>
        <p className="text-muted-foreground">
          Get your authorization token to access the Test Server
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div className="bg-gradient-subtle p-6 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Registration Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Name:</Label>
                <p className="font-medium">{credentials.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email:</Label>
                <p className="font-medium">{credentials.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Roll Number:</Label>
                <p className="font-medium">{credentials.rollNo}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Access Code:</Label>
                <p className="font-medium">{credentials.accessCode}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-card border rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Key className="h-5 w-5" />
              Client Credentials
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label className="text-muted-foreground">Client ID:</Label>
                <code className="block mt-1 p-2 bg-muted rounded text-sm font-mono break-all">
                  {credentials.clientID}
                </code>
              </div>
              <div>
                <Label className="text-muted-foreground">Client Secret:</Label>
                <code className="block mt-1 p-2 bg-muted rounded text-sm font-mono break-all">
                  {credentials.clientSecret}
                </code>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleAuthenticate}
            disabled={isLoading}
            className="w-full bg-gradient-accent hover:shadow-medium transition-spring"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Get Authorization Token
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};