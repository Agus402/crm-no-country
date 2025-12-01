"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Zap, Filter, Clock, Plus, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Action {
  id: string;
  type: string;
  template?: string;
}

interface CreateAutomationRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateRule: (rule: any) => void;
}

export default function CreateAutomationRuleModal({
  open,
  onOpenChange,
  onCreateRule,
}: CreateAutomationRuleModalProps) {
  const [ruleName, setRuleName] = useState("");
  const [trigger, setTrigger] = useState("");
  const [waitDays, setWaitDays] = useState("0");
  const [waitHours, setWaitHours] = useState("0");
  const [actions, setActions] = useState<Action[]>([
    { id: "1", type: "", template: "" },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateRule({
      name: ruleName,
      trigger,
      waitDays: parseInt(waitDays),
      waitHours: parseInt(waitHours),
      actions,
    });
    // Reset form
    setRuleName("");
    setTrigger("");
    setWaitDays("0");
    setWaitHours("0");
    setActions([{ id: "1", type: "", template: "" }]);
    onOpenChange(false);
  };

  const addAction = () => {
    setActions([
      ...actions,
      { id: Date.now().toString(), type: "", template: "" },
    ]);
  };

  const removeAction = (id: string) => {
    if (actions.length > 1) {
      setActions(actions.filter((action) => action.id !== id));
    }
  };

  const updateAction = (id: string, field: string, value: string) => {
    setActions(
      actions.map((action) =>
        action.id === id ? { ...action, [field]: value } : action
      )
    );
  };

  const getTriggerDisplay = () => {
    const triggers: { [key: string]: string } = {
      "new-lead": "New Lead Created",
      "demo-completed": "Demo Completed",
      "invoice-sent": "Invoice Sent",
      "no-response": "No Response for 7 Days",
      "contract-signed": "Contract Signed",
      "payment-received": "Payment Received",
    };
    return triggers[trigger] || trigger;
  };

  const getActionDisplay = (type: string) => {
    const actionTypes: { [key: string]: string } = {
      "send-email": "Send Email",
      "send-whatsapp": "Send WhatsApp",
      "create-task": "Create Task",
      "move-segment": "Move to Segment",
      "send-sms": "Send SMS",
    };
    return actionTypes[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[680px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <DialogTitle>Create Automation Rule</DialogTitle>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Automate your workflow with triggers and actions
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          {/* Rule Name */}
          <div className="space-y-2">
            <Label htmlFor="ruleName" className="text-sm font-medium">
              Rule Name
            </Label>
            <Input
              id="ruleName"
              placeholder="e.g., Welcome New Leads"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              required
            />
          </div>

          {/* When this happens (Trigger) */}
          <Card className="p-3 bg-purple-50 border-purple-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-purple-700 font-medium">
                <Filter className="h-4 w-4" />
                <span className="text-sm">When this happens (Trigger)</span>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="trigger" className="text-sm">
                  Trigger Event
                </Label>
                <Select value={trigger} onValueChange={setTrigger} required>
                  <SelectTrigger id="trigger" className="bg-white">
                    <SelectValue placeholder="Select a trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new-lead">New Lead Created</SelectItem>
                    <SelectItem value="demo-completed">
                      Demo Completed
                    </SelectItem>
                    <SelectItem value="invoice-sent">Invoice Sent</SelectItem>
                    <SelectItem value="no-response">
                      No Response for 7 Days
                    </SelectItem>
                    <SelectItem value="contract-signed">
                      Contract Signed
                    </SelectItem>
                    <SelectItem value="payment-received">
                      Payment Received
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Wait (Optional) */}
          <Card className="p-3 bg-blue-50 border-blue-200">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-medium">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Wait (Optional)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="waitDays" className="text-sm">
                    Days
                  </Label>
                  <Input
                    id="waitDays"
                    type="number"
                    min="0"
                    value={waitDays}
                    onChange={(e) => setWaitDays(e.target.value)}
                    className="bg-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="waitHours" className="text-sm">
                    Hours
                  </Label>
                  <Input
                    id="waitHours"
                    type="number"
                    min="0"
                    max="23"
                    value={waitHours}
                    onChange={(e) => setWaitHours(e.target.value)}
                    className="bg-white"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Do this (Actions) */}
          <Card className="p-3 bg-green-50 border-green-200">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-700 font-medium">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">Do this (Actions)</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addAction}
                  className="text-xs h-7 bg-white hover:bg-green-100 border-green-300"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Action
                </Button>
              </div>

              {actions.map((action, index) => (
                <div key={action.id} className="space-y-2 p-2.5 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      Step {index + 1}
                    </span>
                    {actions.length > 1 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeAction(action.id)}
                        className="h-5 w-5 p-0 hover:bg-red-100"
                      >
                        <X className="h-3 w-3 text-red-600" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">Action Type</Label>
                    <Select
                      value={action.type}
                      onValueChange={(value) =>
                        updateAction(action.id, "type", value)
                      }
                      required
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="send-email">Send Email</SelectItem>
                        <SelectItem value="send-whatsapp">
                          Send WhatsApp
                        </SelectItem>
                        <SelectItem value="create-task">Create Task</SelectItem>
                        <SelectItem value="move-segment">
                          Move to Segment
                        </SelectItem>
                        <SelectItem value="send-sms">Send SMS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(action.type === "send-email" ||
                    action.type === "send-whatsapp" ||
                    action.type === "send-sms") && (
                    <div className="space-y-1.5">
                      <Label className="text-sm">Message Template</Label>
                      <Select
                        value={action.template}
                        onValueChange={(value) =>
                          updateAction(action.id, "template", value)
                        }
                      >
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="welcome">
                            Welcome Message
                          </SelectItem>
                          <SelectItem value="follow-up">
                            Follow-up Message
                          </SelectItem>
                          <SelectItem value="reminder">
                            Reminder Message
                          </SelectItem>
                          <SelectItem value="thank-you">
                            Thank You Message
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Rule Summary */}
          <Card className="p-3 bg-gray-50 border-gray-200">
            <div className="space-y-1.5">
              <h4 className="text-sm font-semibold text-gray-900">
                Rule Summary
              </h4>
              <p className="text-xs text-gray-700">
                When{" "}
                <span className="font-semibold text-purple-600">
                  {getTriggerDisplay() || "a trigger occurs"}
                </span>
                {(parseInt(waitDays) > 0 || parseInt(waitHours) > 0) && (
                  <>
                    , wait{" "}
                    {parseInt(waitDays) > 0 && (
                      <span className="font-semibold text-blue-600">
                        {waitDays} {parseInt(waitDays) === 1 ? "day" : "days"}
                      </span>
                    )}
                    {parseInt(waitDays) > 0 && parseInt(waitHours) > 0 && " and "}
                    {parseInt(waitHours) > 0 && (
                      <span className="font-semibold text-blue-600">
                        {waitHours} {parseInt(waitHours) === 1 ? "hour" : "hours"}
                      </span>
                    )}
                  </>
                )}
                , then execute{" "}
                <span className="font-semibold text-green-600">
                  {actions.length} action{actions.length !== 1 ? "s" : ""}
                </span>
                .
              </p>
            </div>
          </Card>

          {/* Footer Buttons */}
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto"
            >
              <Zap className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

