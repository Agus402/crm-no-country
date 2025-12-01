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

interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: "active" | "inactive";
}

interface EditAutomationRuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: AutomationRule | null;
  onSaveRule: (rule: AutomationRule) => void;
}

export default function EditAutomationRuleModal({
  open,
  onOpenChange,
  rule,
  onSaveRule,
}: EditAutomationRuleModalProps) {
  // Initialize formData with rule data or defaults
  const [formData, setFormData] = useState<AutomationRule>(
    rule || {
      id: "",
      name: "",
      trigger: "",
      action: "",
      status: "active",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveRule(formData);
    onOpenChange(false);
  };

  if (!rule) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} key={rule.id}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Automation Rule</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Rule Name *</Label>
            <Input
              id="name"
              placeholder="e.g., New Lead Welcome Sequence"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="trigger">Trigger *</Label>
            <Select
              value={formData.trigger}
              onValueChange={(value) =>
                setFormData({ ...formData, trigger: value })
              }
            >
              <SelectTrigger id="trigger">
                <SelectValue placeholder="Select a trigger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Contact added to 'Active Lead'">
                  Contact added to &apos;Active Lead&apos;
                </SelectItem>
                <SelectItem value="Demo completed">Demo completed</SelectItem>
                <SelectItem value="Invoice sent">Invoice sent</SelectItem>
                <SelectItem value="No response for 7 days">
                  No response for 7 days
                </SelectItem>
                <SelectItem value="Contract signed">Contract signed</SelectItem>
                <SelectItem value="Payment received">
                  Payment received
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="action">Action *</Label>
            <Select
              value={formData.action}
              onValueChange={(value) =>
                setFormData({ ...formData, action: value })
              }
            >
              <SelectTrigger id="action">
                <SelectValue placeholder="Select an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Send welcome email after 5 minutes">
                  Send welcome email after 5 minutes
                </SelectItem>
                <SelectItem value="Send WhatsApp follow-up after 24 hours">
                  Send WhatsApp follow-up after 24 hours
                </SelectItem>
                <SelectItem value="Send reminder email after 3 days">
                  Send reminder email after 3 days
                </SelectItem>
                <SelectItem value="Send re-engagement email">
                  Send re-engagement email
                </SelectItem>
                <SelectItem value="Create follow-up task">
                  Create follow-up task
                </SelectItem>
                <SelectItem value="Move to 'Hot Lead' segment">
                  Move to &apos;Hot Lead&apos; segment
                </SelectItem>
                <SelectItem value="Send thank you email">
                  Send thank you email
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  status: value as "active" | "inactive",
                })
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
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
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

