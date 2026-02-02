"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import Button from "../ui/button/Button";
import Badge from "../ui/badge/Badge";
// import { TrashIcon, RefreshIcon } from "@/icons";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface PendingAssignment {
  id: string;
  merchantId: string;
  planId: string;
  assignmentType: string;
  scheduledDate?: string;
  durationType: string;
  endDate?: string;
  notes?: string;
  createdAt: string;
  assignedBy: string;
  merchant: {
    id: string;
    name: string;
    contactEmail?: string;
  };
  plan: {
    id: string;
    name: string;
    price: number;
    billingCycle: string;
  };
}

interface PendingAssignmentsProps {
  merchantId?: string;
}

export default function PendingAssignments({ merchantId }: PendingAssignmentsProps) {
  const [assignments, setAssignments] = useState<PendingAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAssignments = async () => {
    setIsLoading(true);
    try {
      const url = merchantId 
        ? `/api/pricing/assignments/pending?merchantId=${merchantId}`
        : '/api/pricing/assignments/pending';
      
      const response = await fetch(url, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch assignments');
      }
      
      const data = await response.json();
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load pending assignments');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelAssignment = async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/pricing/assignments/${assignmentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel assignment');
      }
      
      toast.success('Assignment cancelled successfully');
      fetchAssignments(); // Refresh the list
    } catch (error) {
      console.error('Error cancelling assignment:', error);
      toast.error('Failed to cancel assignment');
    }
  };

  const triggerCleanup = async () => {
    setIsRefreshing(true);
    try {
      const url = merchantId 
        ? `/api/pricing/cleanup/assignments?merchantId=${merchantId}`
        : '/api/pricing/cleanup/assignments';
        
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to trigger cleanup');
      }
      
      const result = await response.json();
      toast.success(result.message || 'Cleanup completed');
      fetchAssignments(); // Refresh the list
    } catch (error) {
      console.error('Error triggering cleanup:', error);
      toast.error('Failed to trigger cleanup');
    } finally {
      setIsRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchAssignments();
  }, [merchantId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading pending assignments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Pending Plan Assignments
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {merchantId ? 'Assignments for this merchant' : 'All pending assignments across the system'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAssignments}
            disabled={isRefreshing}
          >
            {/* <RefreshIcon className="w-4 h-4 mr-2" /> */}
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={triggerCleanup}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Cleaning...
              </>
            ) : (
              'Cleanup Stale'
            )}
          </Button>
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 dark:text-gray-400">
            No pending assignments found
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-gray-700">
              <TableRow>
                <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-xs dark:text-gray-400">
                  MERCHANT
                </TableCell>
                <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-xs dark:text-gray-400">
                  PLAN
                </TableCell>
                <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-xs dark:text-gray-400">
                  TYPE
                </TableCell>
                <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-xs dark:text-gray-400">
                  SCHEDULED
                </TableCell>
                <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-xs dark:text-gray-400">
                  CREATED
                </TableCell>
                <TableCell isHeader className="px-4 py-3 font-medium text-gray-500 text-xs dark:text-gray-400">
                  ACTIONS
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="px-4 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {assignment.merchant.name}
                      </div>
                      {assignment.merchant.contactEmail && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {assignment.merchant.contactEmail}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {assignment.plan.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        ETB {assignment.plan.price.toLocaleString()}/{assignment.plan.billingCycle.toLowerCase()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Badge 
                      color={assignment.assignmentType === 'IMMEDIATE' ? 'warning' : 'info'} 
                      size="sm"
                    >
                      {assignment.assignmentType}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {assignment.scheduledDate 
                      ? new Date(assignment.scheduledDate).toLocaleString()
                      : '—'
                    }
                  </TableCell>
                  <TableCell className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {new Date(assignment.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelAssignment(assignment.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                    >
                      {/* <TrashIcon className="w-4 h-4 mr-1" /> */}
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}