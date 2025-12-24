import 'dart:convert';
import 'dart:io';
import 'package:edtech_syndicate/screens/UserDashboardScreen.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../providers/application_provider.dart';
import 'landing_page.dart';

class ApplicationFormScreen extends StatefulWidget {
  final String? userEmail; // Pre-filled email from registration
  
  const ApplicationFormScreen({Key? key, this.userEmail}) : super(key: key);

  @override
  State<ApplicationFormScreen> createState() => _ApplicationFormScreenState();
}

class _ApplicationFormScreenState extends State<ApplicationFormScreen> {
  int _currentStep = 0;
  final _formKeys = List.generate(5, (_) => GlobalKey<FormState>());

  // Form controllers
  final _fullNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _positionController = TextEditingController();
  final _organizationController = TextEditingController();
  final _specializationController = TextEditingController();
  final _linkedinController = TextEditingController();
  final _motivationController = TextEditingController();
  
  String _yearsExperience = '';
  String _education = '';
  
  // Files
  File? _resumeFile;
  List<File> _certificateFiles = [];
  File? _recommendationFile;

  @override
  void initState() {
    super.initState();
    // Email is now passed as parameter, no need to set it in controller
    // The email controller is no longer used
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _positionController.dispose();
    _organizationController.dispose();
    _specializationController.dispose();
    _linkedinController.dispose();
    _motivationController.dispose();
    super.dispose();
  }

  Future<void> _pickFile(FileType type, Function(File) onPicked) async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'],
    );

    if (result != null && result.files.single.path != null) {
      final file = File(result.files.single.path!);
      
      // Check file size (10MB limit)
      final fileSize = await file.length();
      if (fileSize > 10 * 1024 * 1024) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('File size must be less than 10MB'),
              backgroundColor: Colors.red,
            ),
          );
        }
        return;
      }
      
      onPicked(file);
    }
  }

  Future<String> _fileToBase64(File file) async {
    final bytes = await file.readAsBytes();
    return 'data:application/octet-stream;base64,${base64Encode(bytes)}';
  }

  Future<void> _submitApplication() async {
    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => WillPopScope(
        onWillPop: () async => false,
        child: const Center(
          child: Card(
            child: Padding(
              padding: EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text(
                    'Submitting your application...',
                    style: TextStyle(fontSize: 16),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Please wait',
                    style: TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );

    try {
      // Prepare files
      Map<String, dynamic>? filesData;

      if (_resumeFile != null) {
        filesData = {
          'resume': await _fileToBase64(_resumeFile!),
          'resumeName': _resumeFile!.path.split('/').last,
        };

        if (_certificateFiles.isNotEmpty) {
          filesData['certificates'] = await Future.wait(
            _certificateFiles.map((file) async => {
              'data': await _fileToBase64(file),
              'name': file.path.split('/').last,
            }),
          );
        }

        if (_recommendationFile != null) {
          filesData['recommendation'] = await _fileToBase64(_recommendationFile!);
          filesData['recommendationName'] = _recommendationFile!.path.split('/').last;
        }
      }

      final appProvider = context.read<ApplicationProvider>();
      final success = await appProvider.submitApplication(
        fullName: _fullNameController.text.trim(),
        email: widget.userEmail!, // Use the passed email
        phone: _phoneController.text.trim(),
        position: _positionController.text.trim(),
        organization: _organizationController.text.trim(),
        yearsExperience: _yearsExperience,
        education: _education,
        specialization: _specializationController.text.trim(),
        linkedin: _linkedinController.text.trim().isEmpty ? null : _linkedinController.text.trim(),
        motivation: _motivationController.text.trim(),
        files: filesData,
      );

      // Close loading dialog
      if (mounted) {
        Navigator.of(context).pop();
      }

      if (success && mounted) {
        // Get the submitted application
        final appProvider = context.read<ApplicationProvider>();
        final application = await appProvider.getApplicationByEmail(widget.userEmail!);
        
        // Success - show success dialog
        await showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => AlertDialog(
            title: const Row(
              children: [
                Icon(Icons.check_circle, color: Colors.green, size: 32),
                SizedBox(width: 12),
                Text('Success!'),
              ],
            ),
            content: const Text(
              'Your application has been submitted successfully!\n\n'
              'You can now view your application status.',
            ),
            actions: [
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  // Navigate back to landing page
                  if (mounted) {
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(
                        builder: (context) => const LandingPage(),
                      ),
                      (route) => false,
                    );
                  }
                },
                child: const Text('Later'),
              ),
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  // Navigate to user dashboard to check status
                  if (mounted && application != null) {
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute(
                        builder: (context) => UserDashboardScreen(
                          email: widget.userEmail!,
                          application: application,
                        ),
                      ),
                      (route) => false,
                    );
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                ),
                child: const Text('View Status'),
              ),
            ],
          ),
        );
      } else if (mounted && appProvider.error != null) {
        // Show error dialog
        await showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Row(
              children: [
                Icon(Icons.error, color: Colors.red, size: 32),
                SizedBox(width: 12),
                Text('Error'),
              ],
            ),
            content: Text(
              appProvider.error ?? 'Failed to submit application. Please try again.',
            ),
            actions: [
              ElevatedButton(
                onPressed: () {
                  Navigator.of(context).pop();
                },
                child: const Text('OK'),
              ),
            ],
          ),
        );
      }
    } catch (e) {
      // Close loading dialog
      if (mounted) {
        Navigator.of(context).pop();
      }

      // Show error
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Membership Application'),
        backgroundColor: const Color(0xFF2563EB),
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          // Progress indicator
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF2563EB), Color(0xFF9333EA)],
              ),
            ),
            child: Column(
              children: [
                Row(
                  children: List.generate(5, (index) {
                    return Expanded(
                      child: Container(
                        height: 4,
                        margin: const EdgeInsets.symmetric(horizontal: 2),
                        decoration: BoxDecoration(
                          color: index <= _currentStep
                              ? Colors.white
                              : Colors.white.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 8),
                Text(
                  'Step ${_currentStep + 1} of 5',
                  style: const TextStyle(color: Colors.white),
                ),
              ],
            ),
          ),

          // Form content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: _buildStepContent(),
            ),
          ),

          // Navigation buttons
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.05),
                  blurRadius: 10,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                if (_currentStep > 0)
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        setState(() => _currentStep--);
                      },
                      child: const Text('Previous'),
                    ),
                  ),
                if (_currentStep > 0) const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton(
                    onPressed: () async {
                      if (_formKeys[_currentStep].currentState!.validate()) {
                        if (_currentStep < 4) {
                          setState(() => _currentStep++);
                        } else {
                          await _submitApplication();
                        }
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _currentStep == 4
                          ? Colors.green
                          : const Color(0xFF2563EB),
                      foregroundColor: Colors.white,
                    ),
                    child: Text(_currentStep == 4 ? 'Submit' : 'Next'),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStepContent() {
    switch (_currentStep) {
      case 0:
        return _buildPersonalInfo();
      case 1:
        return _buildProfessionalInfo();
      case 2:
        return _buildAcademicInfo();
      case 3:
        return _buildDocuments();
      case 4:
        return _buildReview();
      default:
        return const SizedBox();
    }
  }

  Widget _buildPersonalInfo() {
    return Form(
      key: _formKeys[0],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Personal Information',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 24),
          
          // Email display (read-only)
          if (widget.userEmail != null)
            Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: Colors.blue.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.blue.shade200),
              ),
              child: Row(
                children: [
                  Icon(Icons.email, color: Colors.blue.shade700),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Email Address',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.blue.shade700,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          widget.userEmail!,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Icon(Icons.lock, color: Colors.blue.shade300, size: 20),
                ],
              ),
            ),
          
          TextFormField(
            controller: _fullNameController,
            decoration: const InputDecoration(
              labelText: 'Full Name *',
              border: OutlineInputBorder(),
            ),
            validator: (v) => v?.isEmpty ?? true ? 'Required' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(
              labelText: 'Phone Number *',
              border: OutlineInputBorder(),
            ),
            validator: (v) => v?.isEmpty ?? true ? 'Required' : null,
          ),
        ],
      ),
    );
  }

  Widget _buildProfessionalInfo() {
    return Form(
      key: _formKeys[1],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Professional Background',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 24),
          TextFormField(
            controller: _positionController,
            decoration: const InputDecoration(
              labelText: 'Current Position *',
              border: OutlineInputBorder(),
            ),
            validator: (v) => v?.isEmpty ?? true ? 'Required' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _organizationController,
            decoration: const InputDecoration(
              labelText: 'Organization/Institution *',
              border: OutlineInputBorder(),
            ),
            validator: (v) => v?.isEmpty ?? true ? 'Required' : null,
          ),
          const SizedBox(height: 16),
          DropdownButtonFormField<String>(
            value: _yearsExperience.isEmpty ? null : _yearsExperience,
            decoration: const InputDecoration(
              labelText: 'Years of Experience *',
              border: OutlineInputBorder(),
            ),
            items: ['0-2', '3-5', '6-10', '11-15', '16+']
                .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                .toList(),
            onChanged: (v) => setState(() => _yearsExperience = v!),
            validator: (v) => v == null ? 'Required' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _linkedinController,
            decoration: const InputDecoration(
              labelText: 'LinkedIn Profile (Optional)',
              border: OutlineInputBorder(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAcademicInfo() {
    return Form(
      key: _formKeys[2],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Academic Background',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 24),
          DropdownButtonFormField<String>(
            value: _education.isEmpty ? null : _education,
            decoration: const InputDecoration(
              labelText: 'Highest Education Level *',
              border: OutlineInputBorder(),
            ),
            items: ['bachelor', 'master', 'phd', 'other']
                .map((e) => DropdownMenuItem(value: e, child: Text(e.toUpperCase())))
                .toList(),
            onChanged: (v) => setState(() => _education = v!),
            validator: (v) => v == null ? 'Required' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _specializationController,
            decoration: const InputDecoration(
              labelText: 'Area of Specialization *',
              border: OutlineInputBorder(),
            ),
            validator: (v) => v?.isEmpty ?? true ? 'Required' : null,
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _motivationController,
            maxLines: 6,
            decoration: const InputDecoration(
              labelText: 'Why do you want to join? *',
              border: OutlineInputBorder(),
              alignLabelWithHint: true,
            ),
            validator: (v) => v?.isEmpty ?? true ? 'Required' : null,
          ),
        ],
      ),
    );
  }

  Widget _buildDocuments() {
    return Form(
      key: _formKeys[3],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Supporting Documents',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'Upload relevant documents to support your application',
            style: TextStyle(color: Colors.grey),
          ),
          const SizedBox(height: 24),
          
          // Resume
          _FileUploadCard(
            title: 'Resume/CV *',
            file: _resumeFile,
            onUpload: () => _pickFile(FileType.any, (file) {
              setState(() => _resumeFile = file);
            }),
            onRemove: () => setState(() => _resumeFile = null),
          ),
          const SizedBox(height: 16),
          
          // Certificates
          _buildCertificatesSection(),
          const SizedBox(height: 16),
          
          // Recommendation
          _FileUploadCard(
            title: 'Letter of Recommendation (Optional)',
            file: _recommendationFile,
            onUpload: () => _pickFile(FileType.any, (file) {
              setState(() => _recommendationFile = file);
            }),
            onRemove: () => setState(() => _recommendationFile = null),
          ),
        ],
      ),
    );
  }

  Widget _buildCertificatesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            const Text('Professional Certificates (Optional)'),
            TextButton.icon(
              onPressed: () => _pickFile(FileType.any, (file) {
                setState(() => _certificateFiles.add(file));
              }),
              icon: const Icon(Icons.add),
              label: const Text('Add'),
            ),
          ],
        ),
        if (_certificateFiles.isNotEmpty)
          ..._certificateFiles.asMap().entries.map((entry) {
            return Card(
              child: ListTile(
                leading: const Icon(Icons.verified),
                title: Text(entry.value.path.split('/').last),
                trailing: IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () {
                    setState(() => _certificateFiles.removeAt(entry.key));
                  },
                ),
              ),
            );
          }),
      ],
    );
  }

  Widget _buildReview() {
    return Form(
      key: _formKeys[4],
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'Review Your Application',
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 24),
          
          _ReviewSection('Personal Information', [
            _ReviewItem('Name', _fullNameController.text),
            if (widget.userEmail != null)
              _ReviewItem('Email', widget.userEmail!),
            _ReviewItem('Phone', _phoneController.text),
          ]),
          
          _ReviewSection('Professional Background', [
            _ReviewItem('Position', _positionController.text),
            _ReviewItem('Organization', _organizationController.text),
            _ReviewItem('Experience', _yearsExperience),
          ]),
          
          _ReviewSection('Academic Background', [
            _ReviewItem('Education', _education),
            _ReviewItem('Specialization', _specializationController.text),
          ]),
          
          _ReviewSection('Documents', [
            if (_resumeFile != null)
              _ReviewItem('Resume', '✓ Uploaded'),
            if (_certificateFiles.isNotEmpty)
              _ReviewItem('Certificates', '${_certificateFiles.length} file(s)'),
            if (_recommendationFile != null)
              _ReviewItem('Recommendation', '✓ Uploaded'),
          ]),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Text(
              'By submitting this application, you confirm that all information provided is accurate and complete.',
              style: TextStyle(fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}

class _FileUploadCard extends StatelessWidget {
  final String title;
  final File? file;
  final VoidCallback onUpload;
  final VoidCallback onRemove;

  const _FileUploadCard({
    required this.title,
    required this.file,
    required this.onUpload,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title),
        const SizedBox(height: 8),
        if (file == null)
          OutlinedButton.icon(
            onPressed: onUpload,
            icon: const Icon(Icons.upload_file),
            label: const Text('Upload File'),
            style: OutlinedButton.styleFrom(
              minimumSize: const Size(double.infinity, 50),
            ),
          )
        else
          Card(
            color: Colors.green.shade50,
            child: ListTile(
              leading: const Icon(Icons.check_circle, color: Colors.green),
              title: Text(file!.path.split('/').last),
              trailing: IconButton(
                icon: const Icon(Icons.close),
                onPressed: onRemove,
              ),
            ),
          ),
      ],
    );
  }
}

class _ReviewSection extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _ReviewSection(this.title, this.children);

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            ...children,
          ],
        ),
      ),
    );
  }
}

class _ReviewItem extends StatelessWidget {
  final String label;
  final String value;

  const _ReviewItem(this.label, this.value);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(color: Colors.grey),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }
}