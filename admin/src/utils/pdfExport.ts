import type { AdminAnalytics } from "@/lib/services/adminDashboardApi";

interface PDFExportOptions {
  analytics: AdminAnalytics;
  dateRange?: {
    from?: string;
    to?: string;
  };
}

const formatAmount = (amount: number) => {
  return `${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ETB`;
};

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export async function exportAnalyticsToPDF({
  analytics,
  dateRange,
}: PDFExportOptions) {
  // Dynamically import jspdf to avoid SSR issues
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPosition = margin;

  // Colors
  const primaryColor: [number, number, number] = [70, 95, 255]; // #465fff
  const textColor: [number, number, number] = [31, 41, 55]; // #1f2937
  const lightGray: [number, number, number] = [243, 244, 246]; // #f3f4f6

  // Helper function to add a new page if needed
  const checkNewPage = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Analytics Report", margin, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Generated on: ${reportDate}`, margin, 35);

  // Date Range
  if (dateRange?.from || dateRange?.to) {
    doc.setFontSize(9);
    const dateRangeText = `Date Range: ${formatDate(dateRange.from)} - ${formatDate(dateRange.to)}`;
    doc.text(dateRangeText, pageWidth - margin, 35, { align: "right" });
  }

  yPosition = 50;

  // User Analytics Section
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("User Analytics", margin, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  autoTable(doc, {
    startY: yPosition,
    head: [["Metric", "Value"]],
    body: [
      ["Total Users", analytics.userAnalytics.totalUsers.toLocaleString()],
      [
        "Total Merchants",
        analytics.userAnalytics.totalMerchants.toLocaleString(),
      ],
    ],
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    margin: { left: margin, right: margin },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Platform Transactions Section
  checkNewPage(30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Platform Transactions", margin, yPosition);
  yPosition += 8;

  autoTable(doc, {
    startY: yPosition,
    head: [["Metric", "Value"]],
    body: [
      [
        "Total Transactions",
        analytics.platformTransactions.totalTransactions.toLocaleString(),
      ],
      [
        "Total Verified",
        analytics.platformTransactions.totalVerified.toLocaleString(),
      ],
      [
        "Total Pending",
        analytics.platformTransactions.totalPending.toLocaleString(),
      ],
      [
        "Total Unsuccessful",
        analytics.platformTransactions.totalUnsuccessful.toLocaleString(),
      ],
      [
        "Total Transaction Amount",
        formatAmount(analytics.platformTransactions.totalTransactionAmount),
      ],
      [
        "Total Tips",
        formatAmount(analytics.platformTransactions.totalTips),
      ],
    ],
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    margin: { left: margin, right: margin },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Wallet Analytics Section
  checkNewPage(20);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Wallet Analytics", margin, yPosition);
  yPosition += 8;

  autoTable(doc, {
    startY: yPosition,
    head: [["Metric", "Amount"]],
    body: [
      [
        "Total Deposits",
        formatAmount(analytics.walletAnalytics.totalDeposits),
      ],
    ],
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    margin: { left: margin, right: margin },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Transaction Type Breakdown
  checkNewPage(30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Transaction Type Breakdown", margin, yPosition);
  yPosition += 8;

  const totalTypeTransactions =
    analytics.transactionTypeBreakdown.qr +
    analytics.transactionTypeBreakdown.cash +
    analytics.transactionTypeBreakdown.bank;

  autoTable(doc, {
    startY: yPosition,
    head: [["Type", "Count", "Percentage"]],
    body: [
      [
        "QR Payments",
        analytics.transactionTypeBreakdown.qr.toLocaleString(),
        `${((analytics.transactionTypeBreakdown.qr / totalTypeTransactions) * 100).toFixed(1)}%`,
      ],
      [
        "Cash",
        analytics.transactionTypeBreakdown.cash.toLocaleString(),
        `${((analytics.transactionTypeBreakdown.cash / totalTypeTransactions) * 100).toFixed(1)}%`,
      ],
      [
        "Bank Transfer",
        analytics.transactionTypeBreakdown.bank.toLocaleString(),
        `${((analytics.transactionTypeBreakdown.bank / totalTypeTransactions) * 100).toFixed(1)}%`,
      ],
    ],
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    margin: { left: margin, right: margin },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Transaction Status Breakdown
  checkNewPage(30);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Transaction Status Breakdown", margin, yPosition);
  yPosition += 8;

  const totalStatusTransactions =
    analytics.transactionStatusBreakdown.successful +
    analytics.transactionStatusBreakdown.failed +
    analytics.transactionStatusBreakdown.pending +
    analytics.transactionStatusBreakdown.expired;

  autoTable(doc, {
    startY: yPosition,
    head: [["Status", "Count", "Percentage"]],
    body: [
      [
        "Successful",
        analytics.transactionStatusBreakdown.successful.toLocaleString(),
        `${((analytics.transactionStatusBreakdown.successful / totalStatusTransactions) * 100).toFixed(1)}%`,
      ],
      [
        "Failed",
        analytics.transactionStatusBreakdown.failed.toLocaleString(),
        `${((analytics.transactionStatusBreakdown.failed / totalStatusTransactions) * 100).toFixed(1)}%`,
      ],
      [
        "Pending",
        analytics.transactionStatusBreakdown.pending.toLocaleString(),
        `${((analytics.transactionStatusBreakdown.pending / totalStatusTransactions) * 100).toFixed(1)}%`,
      ],
      [
        "Expired",
        analytics.transactionStatusBreakdown.expired.toLocaleString(),
        `${((analytics.transactionStatusBreakdown.expired / totalStatusTransactions) * 100).toFixed(1)}%`,
      ],
    ],
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    margin: { left: margin, right: margin },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Provider Usage Statistics
  checkNewPage(40);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Provider/Bank Usage Statistics", margin, yPosition);
  yPosition += 8;

  // Sort providers by count and take top 15
  const sortedProviders = [...analytics.providerUsage]
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const providerRows = sortedProviders.map((p) => [
    p.provider,
    p.count.toLocaleString(),
    p.isCustom ? "Custom Bank" : "Standard Provider",
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Provider/Bank", "Transaction Count", "Type"]],
    body: providerRows,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 4,
    },
    margin: { left: margin, right: margin },
  });
  yPosition = (doc as any).lastAutoTable.finalY + 10;

  // Footer on each page
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" },
    );
    doc.text(
      "FetanPay Analytics Report",
      pageWidth - margin,
      pageHeight - 10,
      { align: "right" },
    );
  }

  // Generate filename
  const dateStr = new Date().toISOString().split("T")[0];
  const filename = `analytics-report-${dateStr}.pdf`;

  // Save PDF
  doc.save(filename);
}


