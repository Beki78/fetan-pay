import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import 'package:fl_chart/fl_chart.dart'; // Add fl_chart to pubspec.yaml
import 'package:animate_do/animate_do.dart'; // Add animate_do to pubspec.yaml
import '../../../../core/bloc/theme/theme_bloc.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> with TickerProviderStateMixin {
  late TabController _tabController;
  int _touchedIndex = -1; // For Chart Interaction

  // Data (Kept your original data structure)
  final List<Map<String, dynamic>> _tabData = [
    {'title': 'Today', 'sales': 1250.75, 'confirmed': 23, 'total': 25, 'periodKey': 'today', 'trend': '+12%'},
    {'title': 'Week', 'sales': 8750.50, 'confirmed': 156, 'total': 168, 'periodKey': 'week', 'trend': '+5%'},
    {'title': 'Month', 'sales': 45250.25, 'confirmed': 678, 'total': 712, 'periodKey': 'month', 'trend': '-2%'},
    {'title': 'Total', 'sales': 125680.90, 'confirmed': 1189, 'total': 1247, 'periodKey': 'total', 'trend': '+8%'},
  ];

  final List<Map<String, dynamic>> _recentTransactions = [
    {'id': 'TXN-001', 'amount': 500.00, 'status': 'CONFIRMED', 'vendor': 'Waiter John', 'timestamp': DateTime.now().subtract(const Duration(minutes: 15)), 'method': 'CBE Mobile'},
    {'id': 'TXN-002', 'amount': 750.25, 'status': 'CONFIRMED', 'vendor': 'Waiter Sarah', 'timestamp': DateTime.now().subtract(const Duration(minutes: 32)), 'method': 'TeleBirr'},
    {'id': 'TXN-003', 'amount': 1200.00, 'status': 'UNCONFIRMED', 'vendor': 'Waiter Mike', 'timestamp': DateTime.now().subtract(const Duration(hours: 1)), 'method': 'Awash Bank'},
    {'id': 'TXN-005', 'amount': 890.75, 'status': 'PENDING', 'vendor': 'Waiter David', 'timestamp': DateTime.now().subtract(const Duration(hours: 3)), 'method': 'CBE Mobile'},
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabData.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // Get theme and define theme-aware colors
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Theme-aware color palette
    final primaryColor = theme.colorScheme.primary;
    final bgColor = theme.scaffoldBackgroundColor;

    // Background decorative colors (subtle for both themes)
    final bgAccentColor = isDark
        ? theme.colorScheme.primary.withOpacity(0.1)
        : theme.colorScheme.primary.withOpacity(0.08);

    final bgSecondaryColor = isDark
        ? theme.colorScheme.secondary.withOpacity(0.08)
        : theme.colorScheme.secondary.withOpacity(0.06);

    return Scaffold(
      backgroundColor: bgColor,
      body: Stack(
        children: [
          // 1. Background Decor (Subtle Gradients for depth)
          Positioned(
            top: -100,
            right: -100,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: bgAccentColor,
              ),
            ),
          ),
          Positioned(
            top: 100,
            left: -50,
            child: Container(
              width: 200,
              height: 200,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: bgSecondaryColor,
              ),
            ),
          ),

          // 2. Main Content
          SafeArea(
            child: Column(
              children: [
                // Enhanced Header (like users screen)
                FadeInDown(
                  duration: const Duration(milliseconds: 600),
                  child: Padding(
                    padding: const EdgeInsets.all(20),
                    child: Row(
                      children: [
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                primaryColor.withOpacity(0.2),
                                primaryColor.withOpacity(0.1),
                              ],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            ),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: primaryColor.withOpacity(0.2),
                                blurRadius: 12,
                                offset: const Offset(0, 6),
                              ),
                            ],
                          ),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(12),
                            child: Image.asset(
                              'assets/images/logo/fetan-logo.png',
                              fit: BoxFit.contain,
                              errorBuilder: (context, error, stackTrace) {
                                return Icon(
                                  Icons.dashboard_rounded,
                                  color: primaryColor,
                                  size: 28,
                                );
                              },
                            ),
                          ),
                        ),
                        const SizedBox(width: 20),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Fetan Pay',
                                style: GoogleFonts.poppins(
                                  fontSize: 28,
                                  fontWeight: FontWeight.w800,
                                  color: primaryColor,
                                  letterSpacing: -0.5,
                                ),
                              ),
                              Text(
                                'Dashboard Overview',
                                style: GoogleFonts.poppins(
                                  fontSize: 14,
                                  color: theme.colorScheme.onSurfaceVariant,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                            ],
                          ),
                        ),
                        BlocBuilder<ThemeBloc, ThemeState>(
                          builder: (context, themeState) {
                            final isDarkMode = themeState.themeMode == ThemeMode.dark;
                            return Container(
                              decoration: BoxDecoration(
                                color: theme.colorScheme.surfaceContainerHighest.withOpacity(0.8),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: IconButton(
                                onPressed: () {
                                  context.read<ThemeBloc>().add(ToggleTheme());
                                },
                                icon: Icon(
                                  isDarkMode ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
                                  color: theme.colorScheme.onSurfaceVariant,
                                ),
                                tooltip: isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode',
                              ),
                            );
                          },
                        ),
                      ],
                    ),
                  ),
                ),

                // Scrollable Content
                Expanded(
                  child: SingleChildScrollView(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 10),

                  // TABS / SUMMARY CARDS
                  FadeInUp(
                    delay: const Duration(milliseconds: 200),
                    child: _buildTabSection(primaryColor),
                  ),
                  const SizedBox(height: 30),

                  // CHARTS & STATS ROW
                  FadeInUp(
                    delay: const Duration(milliseconds: 400),
                    child: LayoutBuilder(
                      builder: (context, constraints) {
                        // Responsive check
                        if (constraints.maxWidth > 800) {
                          return Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(flex: 2, child: _buildAnalyticsCard(primaryColor)),
                              const SizedBox(width: 20),
                              // Expanded(flex: 1, child: _buildPaymentMethodChart(primaryColor)),
                            ],
                          );
                        } else {
                          return Column(
                            children: [
                              _buildAnalyticsCard(primaryColor),
                              const SizedBox(height: 20),
                              // _buildPaymentMethodChart(primaryColor),
                            ],
                          );
                        }
                      },
                    ),
                  ),

                  

                  
                  

                        // Bottom padding
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // --- WIDGET BUILDERS ---

  Widget _buildTabSection(Color primary) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final surfaceColor = theme.colorScheme.surface;
    final shadowColor = theme.shadowColor.withOpacity(isDark ? 0.3 : 0.1);

    return Column(
      children: [
        Container(
          height: 50,
          padding: const EdgeInsets.all(5),
          decoration: BoxDecoration(
            color: surfaceColor,
            borderRadius: BorderRadius.circular(25),
            boxShadow: [BoxShadow(color: shadowColor, blurRadius: 10)],
          ),
          child: TabBar(
            controller: _tabController,
            indicator: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              color: primary,
              boxShadow: [BoxShadow(color: primary.withOpacity(0.3), blurRadius: 8, offset: const Offset(0, 4))],
            ),
            labelColor: Colors.white,
            unselectedLabelColor: theme.textTheme.bodyMedium?.color?.withOpacity(0.6),
            labelStyle: GoogleFonts.poppins(fontWeight: FontWeight.w600, fontSize: 13),
            unselectedLabelStyle: GoogleFonts.poppins(fontWeight: FontWeight.w500, fontSize: 13),
            dividerColor: Colors.transparent,
            overlayColor: WidgetStateProperty.all(Colors.transparent),
            indicatorSize: TabBarIndicatorSize.tab,
            padding: EdgeInsets.zero,
            tabs: _tabData.map((e) => Container(
              alignment: Alignment.center,
              child: Text(e['title']),
            )).toList(),
            onTap: (index) {
              setState(() {});
            },
          ),
        ),
        const SizedBox(height: 20),
        SizedBox(
          height: 160, // Increased height for the summary card to prevent overflow
          child: TabBarView(
            controller: _tabController,
            children: _tabData.map((data) => _buildSummaryCard(data, primary)).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryCard(Map<String, dynamic> data, Color primary) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final theme = Theme.of(context);
        final isDark = theme.brightness == Brightness.dark;

        // Responsive sizing based on available space
        final isSmall = constraints.maxWidth < 300;
        final titleFontSize = isSmall ? 12.0 : 14.0;
        final amountFontSize = isSmall ? 24.0 : 28.0;
        final trendFontSize = isSmall ? 10.0 : 12.0;
        final chartSize = isSmall ? 60.0 : 80.0;
        final padding = isSmall ? 16.0 : 20.0;

        // Theme-aware colors are handled in the main gradient

        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 5),
          padding: EdgeInsets.all(padding),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [primary, primary.withOpacity(0.8)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: primary.withOpacity(isDark ? 0.3 : 0.4),
                blurRadius: 20,
                offset: const Offset(0, 10)
              ),
            ],
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Total Sales',
                      style: GoogleFonts.poppins(color: Colors.white.withOpacity(0.8), fontSize: titleFontSize),
                    ),
                    const SizedBox(height: 4),
                    FittedBox(
                      fit: BoxFit.scaleDown,
                      child: Text(
                        _formatCurrency(data['sales']),
                        style: GoogleFonts.poppins(color: Colors.white, fontSize: amountFontSize, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            data['trend'].toString().contains('+') ? Icons.trending_up : Icons.trending_down,
                            color: Colors.white, size: 14
                          ),
                          const SizedBox(width: 3),
                          Text(
                            "${data['trend']} vs last ${data['periodKey']}",
                            style: GoogleFonts.poppins(color: Colors.white, fontSize: trendFontSize),
                          ),
                        ],
                      ),
                    )
                  ],
                ),
              ),
              // Decorative Circle Chart Ring
              SizedBox(
                height: chartSize,
                width: chartSize,
                child: Stack(
                  children: [
                    PieChart(
                      PieChartData(
                        sectionsSpace: 0,
                        centerSpaceRadius: chartSize * 0.375, // 30% of chart size
                        sections: [
                          PieChartSectionData(color: Colors.white, value: data['confirmed'].toDouble(), radius: 6, showTitle: false),
                          PieChartSectionData(color: Colors.white.withOpacity(0.3), value: (data['total'] - data['confirmed']).toDouble(), radius: 6, showTitle: false),
                        ],
                      ),
                    ),
                    Center(child: Icon(Icons.wallet, color: Colors.white.withOpacity(0.9), size: chartSize * 0.3)),
                  ],
                ),
              )
            ],
          ),
        );
      },
    );
  }

  Widget _buildAnalyticsCard(Color primary) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final surfaceColor = theme.colorScheme.surface;
    final textColor = theme.colorScheme.onSurface;
    final shadowColor = theme.shadowColor.withOpacity(isDark ? 0.3 : 0.08);

    return Container(
      height: 300,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: shadowColor, blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Analytics Overview",
                style: GoogleFonts.poppins(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  color: textColor,
                )
              ),
              Icon(Icons.bar_chart_rounded, color: primary),
            ],
          ),
          const SizedBox(height: 20),
          Expanded(
            child: BarChart(
              BarChartData(
                barTouchData: BarTouchData(
                  touchTooltipData: BarTouchTooltipData(
                    getTooltipColor: (_) => isDark ? theme.colorScheme.surfaceVariant : Colors.blueGrey,
                  ),
                ),
                titlesData: FlTitlesData(
                  show: true,
                  rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                  bottomTitles: AxisTitles(
                    sideTitles: SideTitles(
                      showTitles: true,
                      getTitlesWidget: (double value, TitleMeta meta) {
                        final style = TextStyle(
                          color: textColor.withOpacity(0.6),
                          fontWeight: FontWeight.bold,
                          fontSize: 12
                        );
                        Widget text;
                        switch (value.toInt()) {
                          case 0: text = Text('Mon', style: style); break;
                          case 1: text = Text('Tue', style: style); break;
                          case 2: text = Text('Wed', style: style); break;
                          case 3: text = Text('Thu', style: style); break;
                          case 4: text = Text('Fri', style: style); break;
                          case 5: text = Text('Sat', style: style); break;
                          case 6: text = Text('Sun', style: style); break;
                          default: text = Text('', style: style);
                        }
                        return SideTitleWidget(meta: meta, child: text);
                      },
                    ),
                  ),
                ),
                borderData: FlBorderData(show: false),
                gridData: FlGridData(
                  show: true,
                  drawVerticalLine: false,
                  horizontalInterval: 5,
                  getDrawingHorizontalLine: (value) => FlLine(
                    color: textColor.withOpacity(0.1),
                    strokeWidth: 1,
                  ),
                ),
                barGroups: [
                  _makeGroupData(0, 5, 12, primary),
                  _makeGroupData(1, 16, 12, primary),
                  _makeGroupData(2, 8, 12, primary),
                  _makeGroupData(3, 20, 16, theme.colorScheme.secondary), // Highlight
                  _makeGroupData(4, 14, 12, primary),
                  _makeGroupData(5, 10, 12, primary),
                  _makeGroupData(6, 18, 12, primary),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentMethodChart(Color primary) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final surfaceColor = theme.colorScheme.surface;
    final textColor = theme.colorScheme.onSurface;
    final shadowColor = theme.shadowColor.withOpacity(isDark ? 0.3 : 0.08);

    return Container(
      height: 300,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(24),
        boxShadow: [BoxShadow(color: shadowColor, blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(
        children: [
           Text(
             "Payment Methods",
             style: GoogleFonts.poppins(
               fontWeight: FontWeight.bold,
               fontSize: 16,
               color: textColor,
             )
           ),
           const SizedBox(height: 30),
           Expanded(
             child: PieChart(
               PieChartData(
                 pieTouchData: PieTouchData(
                   touchCallback: (FlTouchEvent event, pieTouchResponse) {
                     setState(() {
                       if (!event.isInterestedForInteractions ||
                           pieTouchResponse == null ||
                           pieTouchResponse.touchedSection == null) {
                         _touchedIndex = -1;
                         return;
                       }
                       _touchedIndex = pieTouchResponse.touchedSection!.touchedSectionIndex;
                     });
                   },
                 ),
                 borderData: FlBorderData(show: false),
                 sectionsSpace: 0,
                 centerSpaceRadius: 40,
                 sections: [
                   _buildPieSection(40, "CBE", theme.colorScheme.primary, 0),
                   _buildPieSection(30, "TeleBirr", theme.colorScheme.secondary, 1),
                   _buildPieSection(15, "Awash", theme.colorScheme.tertiary, 2),
                   _buildPieSection(15, "BOA", theme.colorScheme.error, 3),
                 ],
               ),
             ),
           ),
           const SizedBox(height: 10),
           Wrap(
             spacing: 10,
             runSpacing: 5,
             children: [
               _legendItem(theme.colorScheme.primary, "CBE"),
               _legendItem(theme.colorScheme.secondary, "TeleBirr"),
               _legendItem(theme.colorScheme.tertiary, "Awash"),
             ],
           )
        ],
      ),
    );
  }


  BarChartGroupData _makeGroupData(int x, double y, double width, Color color) {
    return BarChartGroupData(
      x: x,
      barRods: [
        BarChartRodData(
          toY: y,
          width: width,
          color: color,
          borderRadius: BorderRadius.circular(4),
          backDrawRodData: BackgroundBarChartRodData(show: true, toY: 20, color: const Color(0xfff3f3f3)),
        ),
      ],
    );
  }

  PieChartSectionData _buildPieSection(double value, String title, Color color, int index) {
    final isTouched = index == _touchedIndex;
    final radius = isTouched ? 60.0 : 50.0;
    return PieChartSectionData(
      color: color,
      value: value,
      title: isTouched ? "${value.toInt()}%" : '',
      radius: radius,
      titleStyle: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
    );
  }

  Widget _legendItem(Color color, String text) {
    final theme = Theme.of(context);
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(
          text,
          style: GoogleFonts.poppins(
            fontSize: 11,
            color: theme.textTheme.bodySmall?.color?.withOpacity(0.7),
          )
        ),
      ],
    );
  }

  String _formatCurrency(double amount) {
    final formatter = NumberFormat.currency(locale: 'en_ET', symbol: 'ETB ', decimalDigits: 2);
    return formatter.format(amount);
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'CONFIRMED': return Colors.green;
      case 'UNCONFIRMED': return Colors.redAccent;
      case 'PENDING': return Colors.orange;
      default: return Colors.grey;
    }
  }
}