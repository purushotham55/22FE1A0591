import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Terminal, 
  AlertTriangle, 
  Info, 
  Bug, 
  Zap,
  CheckCircle,
  XCircle,
  Database,
  Server,
  Monitor,
  Code
} from "lucide-react";
import { logger, type LogLevel, type LogStack, type LogPackage } from "@/lib/logging-middleware";

interface LogEntry {
  id: string;
  timestamp: string;
  stack: LogStack;
  level: LogLevel;
  package: LogPackage;
  message: string;
  success?: boolean;
}

const levelIcons = {
  debug: Bug,
  info: Info,
  warn: AlertTriangle,
  error: XCircle,
  fatal: Zap,
};

const levelColors = {
  debug: "bg-muted text-muted-foreground",
  info: "bg-primary/10 text-primary",
  warn: "bg-yellow-100 text-yellow-800",
  error: "bg-destructive/10 text-destructive",
  fatal: "bg-destructive text-destructive-foreground",
};

const stackIcons = {
  frontend: Monitor,
  backend: Server,
};

export const LoggingDashboard = () => {
  const [logHistory, setLogHistory] = useState<LogEntry[]>([]);
  const [customLog, setCustomLog] = useState({
    stack: "frontend" as LogStack,
    level: "info" as LogLevel,
    package: "api" as LogPackage,
    message: "",
  });
  const [lastResult, setLastResult] = useState<{ success: boolean; message?: string } | null>(null);

  const addToHistory = (entry: Omit<LogEntry, "id" | "timestamp">) => {
    const newEntry: LogEntry = {
      ...entry,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogHistory(prev => [newEntry, ...prev].slice(0, 50)); // Keep last 50 logs
  };

  const sendCustomLog = async () => {
    if (!customLog.message.trim()) return;

    const result = await logger.log(
      customLog.stack,
      customLog.level,
      customLog.package,
      customLog.message
    );

    setLastResult(result);
    addToHistory({
      ...customLog,
      success: result.success,
    });

    if (result.success) {
      setCustomLog(prev => ({ ...prev, message: "" }));
    }
  };

  const runDemoLogs = async () => {
    const demoLogs = [
      { stack: "frontend" as LogStack, level: "info" as LogLevel, package: "api" as LogPackage, message: "User logged into dashboard" },
      { stack: "frontend" as LogStack, level: "debug" as LogLevel, package: "api" as LogPackage, message: "API call initiated to /user/profile" },
      { stack: "backend" as LogStack, level: "info" as LogLevel, package: "db" as LogPackage, message: "Database connection established" },
      { stack: "backend" as LogStack, level: "warn" as LogLevel, package: "controller" as LogPackage, message: "High response time detected: 2.5s" },
      { stack: "frontend" as LogStack, level: "error" as LogLevel, package: "handler" as LogPackage, message: "Failed to parse user data" },
    ];

    for (const log of demoLogs) {
      const result = await logger.log(log.stack, log.level, log.package, log.message);
      addToHistory({ ...log, success: result.success });
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between logs
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Activity className="h-6 w-6" />
            Affordmed Logging Dashboard
          </CardTitle>
          <p className="text-muted-foreground">
            Monitor and test your logging middleware integration
          </p>
        </CardHeader>
      </Card>

      <Tabs defaultValue="test" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Terminal className="h-4 w-4" />
            Test Logging
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Log History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="test" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Send Custom Log</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Test the logging middleware with custom parameters
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stack</Label>
                    <Select
                      value={customLog.stack}
                      onValueChange={(value: LogStack) =>
                        setCustomLog(prev => ({ ...prev, stack: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frontend">Frontend</SelectItem>
                        <SelectItem value="backend">Backend</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Level</Label>
                    <Select
                      value={customLog.level}
                      onValueChange={(value: LogLevel) =>
                        setCustomLog(prev => ({ ...prev, level: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debug">Debug</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="fatal">Fatal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Package</Label>
                  <Select
                    value={customLog.package}
                    onValueChange={(value: LogPackage) =>
                      setCustomLog(prev => ({ ...prev, package: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="cache">Cache</SelectItem>
                      <SelectItem value="controller">Controller</SelectItem>
                      <SelectItem value="cron_job">Cron Job</SelectItem>
                      <SelectItem value="db">Database</SelectItem>
                      <SelectItem value="domain">Domain</SelectItem>
                      <SelectItem value="handler">Handler</SelectItem>
                      <SelectItem value="repository">Repository</SelectItem>
                      <SelectItem value="route">Route</SelectItem>
                      <SelectItem value="service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea
                    value={customLog.message}
                    onChange={(e) =>
                      setCustomLog(prev => ({ ...prev, message: e.target.value }))
                    }
                    placeholder="Enter your log message..."
                    rows={3}
                  />
                </div>

                <Button
                  onClick={sendCustomLog}
                  disabled={!customLog.message.trim()}
                  className="w-full"
                >
                  <Terminal className="mr-2 h-4 w-4" />
                  Send Log
                </Button>

                {lastResult && (
                  <Alert variant={lastResult.success ? "default" : "destructive"}>
                    <AlertDescription className="flex items-center gap-2">
                      {lastResult.success ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      {lastResult.success
                        ? "Log sent successfully!"
                        : `Failed: ${lastResult.message}`}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Demo Scenarios</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Run predefined logging scenarios to test the system
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={runDemoLogs}
                  variant="outline"
                  className="w-full"
                >
                  <Code className="mr-2 h-4 w-4" />
                  Run Demo Log Sequence
                </Button>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>This will demonstrate:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Frontend user action logging</li>
                    <li>API call debugging</li>
                    <li>Backend database operations</li>
                    <li>Performance warnings</li>
                    <li>Error handling</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Recent Log Entries</CardTitle>
              <p className="text-sm text-muted-foreground">
                View the last 50 log entries sent to the Test Server
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {logHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No logs yet. Send some logs to see them here.
                  </p>
                ) : (
                  logHistory.map((log) => {
                    const LevelIcon = levelIcons[log.level];
                    const StackIcon = stackIcons[log.stack];
                    
                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <LevelIcon className="h-4 w-4" />
                          <StackIcon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={levelColors[log.level]}>
                              {log.level.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{log.package}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {log.timestamp}
                            </span>
                            {log.success !== undefined && (
                              <Badge variant={log.success ? "default" : "destructive"}>
                                {log.success ? "Sent" : "Failed"}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm break-words">{log.message}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};