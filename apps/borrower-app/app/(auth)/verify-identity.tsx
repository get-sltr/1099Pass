/**
 * Verify Identity Screen
 * KYC flow with document upload and selfie capture
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button, Card, useToast } from '../../src/components/ui';
import { colors, spacing, textStyles, borderRadius } from '../../src/theme';

type Step = 'intro' | 'document' | 'selfie' | 'processing' | 'success' | 'error';

type DocumentType = 'drivers_license' | 'passport' | 'state_id';

const DOCUMENT_TYPES: { type: DocumentType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { type: 'drivers_license', label: "Driver's License", icon: 'car-outline' },
  { type: 'passport', label: 'Passport', icon: 'globe-outline' },
  { type: 'state_id', label: 'State ID', icon: 'card-outline' },
];

export default function VerifyIdentityScreen() {
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>('intro');
  const [documentType, setDocumentType] = useState<DocumentType | null>(null);
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showToast({
        type: 'error',
        title: 'Camera access required',
        message: 'Please enable camera access in your device settings',
      });
      return false;
    }
    return true;
  };

  const captureDocument = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setDocumentImage(result.assets[0].uri);
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Camera error',
        message: 'Failed to capture image. Please try again.',
      });
    }
  };

  const captureSelfie = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        cameraType: ImagePicker.CameraType.front,
      });

      if (!result.canceled && result.assets[0]) {
        setSelfieImage(result.assets[0].uri);
      }
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Camera error',
        message: 'Failed to capture selfie. Please try again.',
      });
    }
  };

  const handleSubmitVerification = async () => {
    setStep('processing');

    try {
      // TODO: Call API to submit verification documents
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Simulate success (80% of the time) or processing (20%)
      const random = Math.random();
      if (random > 0.2) {
        setStep('success');
      } else {
        // In real app, this would be "pending review"
        setStep('success');
      }
    } catch (error) {
      setStep('error');
    }
  };

  const renderIntroStep = () => (
    <>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="shield-checkmark" size={48} color={colors.primary} />
        </View>
        <Text style={styles.title}>Verify Your Identity</Text>
        <Text style={styles.subtitle}>
          To protect your financial data and comply with regulations, we need to verify your identity.
        </Text>
      </View>

      <Card variant="mint" style={styles.infoCard}>
        <Text style={styles.infoTitle}>Why we need this</Text>
        <View style={styles.infoItem}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>Protect your sensitive financial information</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>Ensure only you can access your income data</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="document-text-outline" size={20} color={colors.primary} />
          <Text style={styles.infoText}>Meet lender verification requirements</Text>
        </View>
      </Card>

      <View style={styles.stepsPreview}>
        <Text style={styles.stepsTitle}>What you'll need:</Text>
        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepText}>A valid government-issued ID</Text>
        </View>
        <View style={styles.stepItem}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.stepText}>A selfie to match your ID photo</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Continue"
          onPress={() => setStep('document')}
          variant="primary"
          size="large"
          fullWidth
        />
        <Button
          title="Skip for Now"
          onPress={() => router.replace('/(onboarding)/connect-accounts')}
          variant="ghost"
          size="large"
          fullWidth
          style={styles.skipButton}
        />
      </View>
    </>
  );

  const renderDocumentStep = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 1 of 2</Text>
        <Text style={styles.title}>Upload Your ID</Text>
        <Text style={styles.subtitle}>
          Select your document type and take a clear photo
        </Text>
      </View>

      <Text style={styles.sectionLabel}>Document Type</Text>
      <View style={styles.documentTypes}>
        {DOCUMENT_TYPES.map((doc) => (
          <TouchableOpacity
            key={doc.type}
            style={[
              styles.documentTypeCard,
              documentType === doc.type && styles.documentTypeCardSelected,
            ]}
            onPress={() => setDocumentType(doc.type)}
          >
            <Ionicons
              name={doc.icon}
              size={24}
              color={documentType === doc.type ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.documentTypeLabel,
                documentType === doc.type && styles.documentTypeLabelSelected,
              ]}
            >
              {doc.label}
            </Text>
            {documentType === doc.type && (
              <View style={styles.checkmark}>
                <Ionicons name="checkmark" size={14} color={colors.textInverse} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {documentType && (
        <>
          <Text style={[styles.sectionLabel, { marginTop: spacing[6] }]}>Document Photo</Text>
          {documentImage ? (
            <View style={styles.imagePreview}>
              <Image source={{ uri: documentImage }} style={styles.previewImage} />
              <TouchableOpacity
                style={styles.retakeButton}
                onPress={captureDocument}
              >
                <Ionicons name="camera-outline" size={20} color={colors.textInverse} />
                <Text style={styles.retakeText}>Retake</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.captureArea}
              onPress={captureDocument}
            >
              <Ionicons name="camera-outline" size={40} color={colors.textSecondary} />
              <Text style={styles.captureText}>Tap to take photo</Text>
              <Text style={styles.captureHint}>
                Make sure all corners are visible and text is readable
              </Text>
            </TouchableOpacity>
          )}
        </>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Continue"
          onPress={() => setStep('selfie')}
          variant="primary"
          size="large"
          fullWidth
          disabled={!documentType || !documentImage}
        />
      </View>
    </>
  );

  const renderSelfieStep = () => (
    <>
      <View style={styles.header}>
        <Text style={styles.stepLabel}>Step 2 of 2</Text>
        <Text style={styles.title}>Take a Selfie</Text>
        <Text style={styles.subtitle}>
          We'll match this with your ID photo to verify it's really you
        </Text>
      </View>

      <Card variant="outlined" style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Tips for a good selfie:</Text>
        <View style={styles.tip}>
          <Ionicons name="sunny-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.tipText}>Find good lighting</Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="glasses-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.tipText}>Remove glasses or hats</Text>
        </View>
        <View style={styles.tip}>
          <Ionicons name="happy-outline" size={18} color={colors.textSecondary} />
          <Text style={styles.tipText}>Keep a neutral expression</Text>
        </View>
      </Card>

      {selfieImage ? (
        <View style={styles.selfiePreview}>
          <Image source={{ uri: selfieImage }} style={styles.selfieImage} />
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={captureSelfie}
          >
            <Ionicons name="camera-outline" size={20} color={colors.textInverse} />
            <Text style={styles.retakeText}>Retake</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.selfieArea}
          onPress={captureSelfie}
        >
          <View style={styles.selfieFrame}>
            <Ionicons name="person-outline" size={60} color={colors.textSecondary} />
          </View>
          <Text style={styles.captureText}>Tap to take selfie</Text>
        </TouchableOpacity>
      )}

      <View style={styles.buttonContainer}>
        <Button
          title="Submit for Verification"
          onPress={handleSubmitVerification}
          variant="primary"
          size="large"
          fullWidth
          disabled={!selfieImage}
          loading={isUploading}
        />
      </View>
    </>
  );

  const renderProcessingStep = () => (
    <View style={styles.centerContent}>
      <View style={styles.processingIcon}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      <Text style={styles.processingTitle}>Verifying Your Identity</Text>
      <Text style={styles.processingSubtitle}>
        This usually takes less than a minute. Please don't close the app.
      </Text>

      <View style={styles.processingSteps}>
        <View style={styles.processingStep}>
          <Ionicons name="checkmark-circle" size={24} color={colors.success} />
          <Text style={styles.processingStepText}>Documents uploaded</Text>
        </View>
        <View style={styles.processingStep}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.processingStepText}>Analyzing documents...</Text>
        </View>
        <View style={styles.processingStep}>
          <Ionicons name="ellipse-outline" size={24} color={colors.border} />
          <Text style={[styles.processingStepText, { color: colors.textTertiary }]}>
            Matching selfie
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSuccessStep = () => (
    <View style={styles.centerContent}>
      <View style={styles.successIcon}>
        <Ionicons name="checkmark-circle" size={80} color={colors.success} />
      </View>
      <Text style={styles.successTitle}>Identity Verified!</Text>
      <Text style={styles.successSubtitle}>
        Your identity has been successfully verified. You're all set to connect your income sources.
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Continue to Connect Accounts"
          onPress={() => router.replace('/(onboarding)/connect-accounts')}
          variant="primary"
          size="large"
          fullWidth
        />
      </View>
    </View>
  );

  const renderErrorStep = () => (
    <View style={styles.centerContent}>
      <View style={styles.errorIcon}>
        <Ionicons name="alert-circle" size={80} color={colors.error} />
      </View>
      <Text style={styles.errorTitle}>Verification Failed</Text>
      <Text style={styles.errorSubtitle}>
        We couldn't verify your identity. This might be due to image quality or a mismatch. Please try again.
      </Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Try Again"
          onPress={() => {
            setDocumentImage(null);
            setSelfieImage(null);
            setStep('document');
          }}
          variant="primary"
          size="large"
          fullWidth
        />
        <Button
          title="Contact Support"
          onPress={() => {
            // TODO: Open support
            showToast({
              type: 'info',
              title: 'Support',
              message: 'Support chat coming soon',
            });
          }}
          variant="ghost"
          size="large"
          fullWidth
          style={styles.skipButton}
        />
      </View>
    </View>
  );

  const canGoBack = step === 'document' || step === 'selfie';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing[4], paddingBottom: insets.bottom + spacing[4] },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Back button */}
      {canGoBack && (
        <TouchableOpacity
          onPress={() => {
            if (step === 'selfie') setStep('document');
            else if (step === 'document') setStep('intro');
          }}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      )}

      {step === 'intro' && renderIntroStep()}
      {step === 'document' && renderDocumentStep()}
      {step === 'selfie' && renderSelfieStep()}
      {step === 'processing' && renderProcessingStep()}
      {step === 'success' && renderSuccessStep()}
      {step === 'error' && renderErrorStep()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    paddingHorizontal: spacing[6],
    flexGrow: 1,
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing[2],
    marginBottom: spacing[2],
  },

  header: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },

  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },

  stepLabel: {
    ...textStyles.caption,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing[2],
  },

  title: {
    ...textStyles.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },

  subtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },

  infoCard: {
    marginBottom: spacing[6],
  },

  infoTitle: {
    ...textStyles.bodySmall,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing[3],
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },

  infoText: {
    ...textStyles.bodySmall,
    color: colors.textPrimary,
    marginLeft: spacing[3],
    flex: 1,
  },

  stepsPreview: {
    marginBottom: spacing[6],
  },

  stepsTitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing[3],
  },

  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[3],
  },

  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing[3],
  },

  stepNumberText: {
    ...textStyles.bodySmall,
    color: colors.textInverse,
    fontWeight: '600',
  },

  stepText: {
    ...textStyles.body,
    color: colors.textPrimary,
  },

  buttonContainer: {
    marginTop: 'auto',
    paddingTop: spacing[4],
  },

  skipButton: {
    marginTop: spacing[2],
  },

  sectionLabel: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing[3],
  },

  documentTypes: {
    flexDirection: 'row',
    gap: spacing[3],
  },

  documentTypeCard: {
    flex: 1,
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    position: 'relative',
  },

  documentTypeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.mintSoft,
  },

  documentTypeLabel: {
    ...textStyles.caption,
    color: colors.textSecondary,
    marginTop: spacing[2],
    textAlign: 'center',
  },

  documentTypeLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },

  checkmark: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  captureArea: {
    height: 200,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  captureText: {
    ...textStyles.body,
    color: colors.textSecondary,
    marginTop: spacing[3],
  },

  captureHint: {
    ...textStyles.caption,
    color: colors.textTertiary,
    marginTop: spacing[1],
    textAlign: 'center',
    maxWidth: 200,
  },

  imagePreview: {
    height: 200,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },

  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  retakeButton: {
    position: 'absolute',
    bottom: spacing[3],
    right: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
  },

  retakeText: {
    ...textStyles.bodySmall,
    color: colors.textInverse,
    marginLeft: spacing[1],
  },

  tipsCard: {
    marginBottom: spacing[4],
  },

  tipsTitle: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing[3],
  },

  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[2],
  },

  tipText: {
    ...textStyles.bodySmall,
    color: colors.textSecondary,
    marginLeft: spacing[2],
  },

  selfieArea: {
    alignItems: 'center',
    paddingVertical: spacing[8],
  },

  selfieFrame: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },

  selfiePreview: {
    alignItems: 'center',
    position: 'relative',
  },

  selfieImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },

  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing[8],
  },

  processingIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.mintSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },

  processingTitle: {
    ...textStyles.h3,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },

  processingSubtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    marginBottom: spacing[6],
  },

  processingSteps: {
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing[4],
  },

  processingStep: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },

  processingStepText: {
    ...textStyles.body,
    color: colors.textPrimary,
    marginLeft: spacing[3],
  },

  successIcon: {
    marginBottom: spacing[4],
  },

  successTitle: {
    ...textStyles.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },

  successSubtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },

  errorIcon: {
    marginBottom: spacing[4],
  },

  errorTitle: {
    ...textStyles.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing[2],
  },

  errorSubtitle: {
    ...textStyles.body,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
});
