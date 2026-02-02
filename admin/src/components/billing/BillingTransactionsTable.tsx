"use client";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { 
  DownloadIcon, 
  EyeIcon, 
  ChevronDownIcon,
  FileIcon 
} from "@/icons";
import { useGetBillingTransactionsQuery } from "@/lib/redux/features/pricingApi";

export default function BillingTransactionsTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState("All");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [page, setPage] = useState(1);
  const [isPlanDropdownOpen, setIsPlanDropdownOpen] = useState(false);
  const limit = 20;

  const { data: transactionsResponse, isLoading, error } = useGetBillingTransactionsQuery({
    page,
    limit
  });

  const transactions = transactionsResponse?.data || [];

  // Filter transactions based on search and filters (client-side filtering for now)
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.merchant.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      transaction.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (transaction.paymentReference?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesPlan = planFilter === "All" || transaction.plan.name === planFilter;
    
    return matchesSearch && matchesPlan;
  });

  const handleExportCSV = () => {
    console.log("Exporting to CSV...");
    // TODO: Implement CSV export
  };

  const handleExportPDF = () => {
    console.log("Exporting to PDF...");
    // TODO: Implement PDF export
  };

  const getStatusBadge = (status: string, paymentMethod?: string | null, notes?: string | null) => {
    // Check if it's an admin upgrade
    const isAdminUpgrade = paymentMethod === 'Admin Assignment' || notes?.includes('Admin upgrade');
    
    if (isAdminUpgrade) {
      return <Badge color="info" size="sm">Admin Upgrade</Badge>;
    }
    
    switch (status) {
      case 'VERIFIED':
        return <Badge color="success" size="sm">Verified</Badge>;
      case 'PENDING':
        return <Badge color="warning" size="sm">Pending</Badge>;
      case 'FAILED':
        return <Badge color="error" size="sm">Failed</Badge>;
      case 'EXPIRED':
        return <Badge color="secondary" size="sm">Expired</Badge>;
      default:
        return <Badge color="secondary" size="sm">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-500 dark:text-gray-400">Loading transactions...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">Failed to load transactions</div>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search
          </label>
          <Input
            type="text"
            placeholder="Search merchants, emails, transaction IDs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Plan
          </label>
          <div className="relative">
            <Button 
              variant="outline" 
              className="w-full justify-between dropdown-toggle"
              onClick={() => setIsPlanDropdownOpen(!isPlanDropdownOpen)}
            >
              {planFilter}
              <ChevronDownIcon className="w-4 h-4" />
            </Button>
            <Dropdown
              isOpen={isPlanDropdownOpen}
              onClose={() => setIsPlanDropdownOpen(false)}
            >
              <DropdownItem onClick={() => {
                setPlanFilter("All");
                setIsPlanDropdownOpen(false);
              }}>All</DropdownItem>
              <DropdownItem onClick={() => {
                setPlanFilter("Free");
                setIsPlanDropdownOpen(false);
              }}>Free</DropdownItem>
              <DropdownItem onClick={() => {
                setPlanFilter("Starter");
                setIsPlanDropdownOpen(false);
              }}>Starter</DropdownItem>
              <DropdownItem onClick={() => {
                setPlanFilter("Business");
                setIsPlanDropdownOpen(false);
              }}>Business</DropdownItem>
              <DropdownItem onClick={() => {
                setPlanFilter("Custom");
                setIsPlanDropdownOpen(false);
              }}>Custom</DropdownItem>
            </Dropdown>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Date Range
          </label>
          <div className="flex gap-2">
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              placeholder="From"
            />
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              placeholder="To"
            />
          </div>
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredTransactions.length} of {transactionsResponse?.pagination.total || 0} transactions
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <DownloadIcon className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportPDF}>
            <FileIcon className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-200 dark:border-gray-700">
              <TableRow className="bg-gray-50 dark:bg-gray-800/80">
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Transaction ID
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Merchant
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Plan
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Amount
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Reference
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3.5 font-semibold text-gray-600 dark:text-gray-400 text-start text-sm uppercase tracking-wide"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                    No transactions found matching your criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/70 transition-colors"
                  >
                    <TableCell className="px-5 py-4">
                      <span className="font-mono text-sm text-gray-900 dark:text-white">
                        {transaction.transactionId}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {transaction.merchant.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transaction.merchant.contactEmail || "—"}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {transaction.plan.name}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {transaction.currency} {transaction.amount.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      {getStatusBadge(transaction.status, transaction.paymentMethod, transaction.notes)}
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        {transaction.paymentReference || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                        <br />
                        {new Date(transaction.createdAt).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4">
                      <div className="flex gap-2">
                        {transaction.receiptUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(transaction.receiptUrl || '', '_blank')}
                            className="text-blue-700 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/20"
                          >
                            <EyeIcon className="w-4 h-4 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {transactionsResponse && transactionsResponse.pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {transactionsResponse.pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === transactionsResponse.pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}