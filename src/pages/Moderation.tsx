import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Flag, Shield, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface Report {
  id: string;
  type: string;
  reason: string;
  content_type: string;
  content_id: string;
  reporter_id: string;
  status: "pending" | "reviewed" | "resolved";
  created_at: string;
  updated_at: string;
}

interface FlaggedContent {
  id: string;
  type: "post" | "comment" | "user" | "message";
  content: string;
  flag_count: number;
  status: "flagged" | "reviewed" | "removed";
  created_at: string;
  reporter: {
    username: string;
    avatar_url: string;
  };
}

const Moderation = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      // Check if user is admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "admin") {
        navigate("/home");
        return;
      }

      setIsAdmin(true);
      fetchReports();
    };

    checkUser();
  }, [navigate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast({ title: "Error", description: "Failed to fetch reports", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleReviewReport = async () => {
    if (!selectedReport || !reviewAction) return;

    setProcessing(true);
    try {
      // Update report status
      const { error: updateError } = await supabase
        .from("reports")
        .update({
          status: "reviewed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedReport.id);

      if (updateError) throw updateError;

      // If action is to remove content, do it based on content type
      if (reviewAction === "remove") {
        if (selectedReport.content_type === "post") {
          await supabase.from("posts").delete().eq("id", selectedReport.content_id);
        } else if (selectedReport.content_type === "comment") {
          await supabase.from("comments").delete().eq("id", selectedReport.content_id);
        } else if (selectedReport.content_type === "user") {
          // Suspend user
          await supabase.from("profiles").update({ suspended: true }).eq("id", selectedReport.content_id);
        }
      }

      toast({
        title: "Report reviewed",
        description: `Content ${reviewAction === "remove" ? "removed" : "approved"}. Action recorded.`,
      });

      setReviewOpen(false);
      setSelectedReport(null);
      setReviewAction("");
      setReviewNotes("");
      fetchReports();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        {user && <Navigation user={user} />}
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingReports = reports.filter(r => r.status === "pending");
  const reviewedReports = reports.filter(r => r.status === "reviewed");

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} />
      <main className="max-w-6xl mx-auto pt-20 pb-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{pendingReports.length}</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Reviewed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{reviewedReports.length}</div>
              </CardContent>
            </Card>
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{reports.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Reports Tabs */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="pending" className="w-full">
                <TabsList>
                  <TabsTrigger value="pending">Pending ({pendingReports.length})</TabsTrigger>
                  <TabsTrigger value="reviewed">Reviewed ({reviewedReports.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-4">
                  {pendingReports.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No pending reports</p>
                  ) : (
                    pendingReports.map((report) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 border border-destructive/50 rounded-lg bg-destructive/5"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Flag className="w-4 h-4 text-destructive" />
                              <span className="font-semibold capitalize">{report.type}</span>
                              <Badge variant="destructive">Pending</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Content Type: {report.content_type}
                            </p>
                          </div>
                          <Dialog open={reviewOpen && selectedReport?.id === report.id} onOpenChange={setReviewOpen}>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedReport(report)}
                              >
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Review Report</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm">Reason</Label>
                                  <p className="text-sm text-muted-foreground mt-1">{report.reason}</p>
                                </div>
                                <div>
                                  <Label className="text-sm">Action</Label>
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      size="sm"
                                      variant={reviewAction === "approve" ? "default" : "outline"}
                                      onClick={() => setReviewAction("approve")}
                                      className="flex-1"
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={reviewAction === "remove" ? "destructive" : "outline"}
                                      onClick={() => setReviewAction("remove")}
                                      className="flex-1"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor="notes" className="text-sm">
                                    Notes
                                  </Label>
                                  <Textarea
                                    id="notes"
                                    placeholder="Add moderation notes..."
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                  />
                                </div>
                                <Button
                                  onClick={handleReviewReport}
                                  disabled={processing || !reviewAction}
                                  className="w-full gradient-primary"
                                >
                                  {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                  Complete Review
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <p className="text-sm">{report.reason}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Reported {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </motion.div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="reviewed" className="space-y-4">
                  {reviewedReports.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">No reviewed reports</p>
                  ) : (
                    reviewedReports.map((report) => (
                      <motion.div
                        key={report.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 border border-primary/50 rounded-lg bg-primary/5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="w-4 h-4 text-primary" />
                              <span className="font-semibold capitalize">{report.type}</span>
                              <Badge variant="secondary">Reviewed</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Content Type: {report.content_type}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm mt-2">{report.reason}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Reviewed {new Date(report.updated_at).toLocaleDateString()}
                        </p>
                      </motion.div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default Moderation;
