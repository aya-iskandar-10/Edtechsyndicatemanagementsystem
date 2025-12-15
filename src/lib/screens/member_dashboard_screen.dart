import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:intl/intl.dart';
import '../providers/auth_provider.dart';
import '../providers/application_provider.dart';
import '../models/application.dart';

class MemberDashboardScreen extends StatefulWidget {
  const MemberDashboardScreen({Key? key}) : super(key: key);

  @override
  State<MemberDashboardScreen> createState() => _MemberDashboardScreenState();
}

class _MemberDashboardScreenState extends State<MemberDashboardScreen> {
  @override
  void initState() {
    super.initState();
    _loadApplication();
  }

  Future<void> _loadApplication() async {
    final authProvider = context.read<AuthProvider>();
    final appProvider = context.read<ApplicationProvider>();
    
    if (authProvider.userId != null) {
      await appProvider.getApplication(authProvider.userId!);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Member Dashboard'),
        backgroundColor: const Color(0xFF2563EB),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await context.read<AuthProvider>().signOut();
              if (mounted) {
                Navigator.of(context).pushAndRemoveUntil(
                  MaterialPageRoute(builder: (context) => const SizedBox()),
                  (route) => false,
                );
              }
            },
          ),
        ],
      ),
      body: Consumer<ApplicationProvider>(
        builder: (context, appProvider, _) {
          if (appProvider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final application = appProvider.currentApplication;
          if (application == null) {
            return const Center(child: Text('No application found'));
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Status Alert
                _buildStatusAlert(application),
                const SizedBox(height: 24),
                
                // Membership Card
                _buildMembershipCard(application),
                const SizedBox(height: 24),
                
                // Contact Info
                _buildContactInfo(application),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildStatusAlert(Application application) {
    final config = _getStatusConfig(application.status);
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: config.color.withOpacity(0.1),
        border: Border.all(color: config.color),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(config.icon, color: config.color, size: 32),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Status: ${config.label}',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: config.color,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  config.message,
                  style: const TextStyle(fontSize: 14),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMembershipCard(Application application) {
    return Container(
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Color(0xFF2563EB),
            Color(0xFF9333EA),
            Color(0xFF2563EB),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'EdTech Syndicate',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Professional Membership',
                          style: TextStyle(
                            color: Colors.white70,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    if (application.membershipNumber != null)
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          const Text(
                            'Member #',
                            style: TextStyle(
                              color: Colors.white70,
                              fontSize: 10,
                            ),
                          ),
                          Text(
                            application.membershipNumber!,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 14,
                              fontFamily: 'monospace',
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
                const SizedBox(height: 32),
                
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _CardField('Full Name', application.fullName),
                          const SizedBox(height: 16),
                          _CardField('Position', application.position),
                          const SizedBox(height: 16),
                          _CardField('Organization', application.organization),
                          const SizedBox(height: 16),
                          Row(
                            children: [
                              Expanded(
                                child: _CardField(
                                  'Status',
                                  application.status.name.toUpperCase(),
                                ),
                              ),
                              if (application.expiryDate != null)
                                Expanded(
                                  child: _CardField(
                                    'Expires',
                                    DateFormat('MM/dd/yyyy').format(application.expiryDate!),
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    
                    // QR Code
                    if (application.status == ApplicationStatus.approved)
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: QrImageView(
                          data: jsonEncode({
                            'id': application.id,
                            'name': application.fullName,
                            'membershipNumber': application.membershipNumber,
                            'status': application.status.name,
                            'expiryDate': application.expiryDate?.toIso8601String(),
                          }),
                          version: QrVersions.auto,
                          size: 120,
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
          
          // Footer
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.2),
              borderRadius: const BorderRadius.only(
                bottomLeft: Radius.circular(16),
                bottomRight: Radius.circular(16),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Member since ${DateFormat('MMM yyyy').format(application.submittedAt)}',
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
                if (application.status == ApplicationStatus.approved)
                  TextButton.icon(
                    onPressed: () {
                      // Download card functionality
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Download feature coming soon!'),
                        ),
                      );
                    },
                    icon: const Icon(Icons.download, color: Colors.white, size: 16),
                    label: const Text(
                      'Download',
                      style: TextStyle(color: Colors.white, fontSize: 12),
                    ),
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContactInfo(Application application) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Contact Information',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            _ContactItem(Icons.email, 'Email', application.email),
            const SizedBox(height: 12),
            _ContactItem(Icons.phone, 'Phone', application.phone),
            const SizedBox(height: 12),
            _ContactItem(
              Icons.calendar_today,
              'Submitted',
              DateFormat('MMM dd, yyyy').format(application.submittedAt),
            ),
          ],
        ),
      ),
    );
  }

  _StatusConfig _getStatusConfig(ApplicationStatus status) {
    switch (status) {
      case ApplicationStatus.pending:
        return _StatusConfig(
          icon: Icons.schedule,
          label: 'Pending Review',
          color: Colors.orange,
          message: 'Your application is being reviewed by the admissions committee.',
        );
      case ApplicationStatus.approved:
        return _StatusConfig(
          icon: Icons.check_circle,
          label: 'Approved',
          color: Colors.green,
          message: 'Congratulations! Your membership is active.',
        );
      case ApplicationStatus.rejected:
        return _StatusConfig(
          icon: Icons.cancel,
          label: 'Rejected',
          color: Colors.red,
          message: 'Your application was not approved at this time.',
        );
      case ApplicationStatus.expired:
        return _StatusConfig(
          icon: Icons.warning,
          label: 'Expired',
          color: Colors.grey,
          message: 'Your membership has expired.',
        );
    }
  }
}

class _StatusConfig {
  final IconData icon;
  final String label;
  final Color color;
  final String message;

  _StatusConfig({
    required this.icon,
    required this.label,
    required this.color,
    required this.message,
  });
}

class _CardField extends StatelessWidget {
  final String label;
  final String value;

  const _CardField(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            color: Colors.white70,
            fontSize: 10,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
          ),
        ),
      ],
    );
  }
}

class _ContactItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _ContactItem(this.icon, this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.blue.shade50,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: Colors.blue, size: 20),
        ),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              label,
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
            Text(
              value,
              style: const TextStyle(fontSize: 14),
            ),
          ],
        ),
      ],
    );
  }
}
