'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadZone } from '@/components/demo/upload-zone';
import { OcrResult } from '@/components/demo/ocr-result';
import { TrustDashboard } from '@/components/demo/trust-dashboard';
import { Spinner } from '@/components/ui/spinner';
import { type OcrResult as OcrResultType } from '@/types/receipt';
import { type TrustReport } from '@/types/trust';
import toast from 'react-hot-toast';
import { imageToBase64, getMimeType, hashImage } from '@/lib/utils/hash';
import { CheckCircle, AlertCircle } from 'lucide-react';

type Stage = 'upload' | 'ocr' | 'trust' | 'transfer' | 'complete';

export default function DemoPage() {
  const [stage, setStage] = useState<Stage>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrResultType | null>(null);
  const [trustReport, setTrustReport] = useState<TrustReport | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [transferResult, setTransferResult] = useState<any>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setStage('ocr');

    try {
      setIsLoading(true);

      // Step 1: Upload and OCR
      const formData = new FormData();
      formData.append('file', selectedFile);

      const ocrResponse = await fetch('/api/ai/ocr', {
        method: 'POST',
        body: formData,
      });

      if (!ocrResponse.ok) {
        throw new Error('OCR processing failed');
      }

      const ocrData = await ocrResponse.json();
      setReceiptId(ocrData.receipt_id);
      setOcrResult(ocrData.ocr_result);

      if (ocrData.ocr_result.confidence < 0.3) {
        setError(
          'Receipt confidence too low. Please try a clearer image.'
        );
        setStage('upload');
        setIsLoading(false);
        return;
      }

      // Step 2: Trust verification
      setStage('trust');
      const imageHash = await hashImage(selectedFile);

      const trustResponse = await fetch('/api/trust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receipt_id: ocrData.receipt_id,
          ocr_result: ocrData.ocr_result,
          image_hash: imageHash,
        }),
      });

      if (!trustResponse.ok) {
        throw new Error('Trust verification failed');
      }

      const trustData = await trustResponse.json();
      setTrustReport(trustData.trust_report);

      // Step 3: Transfer (if approved)
      if (trustData.trust_report.verdict === 'approved') {
        setStage('transfer');

        const transferResponse = await fetch('/api/transfer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            receipt_id: ocrData.receipt_id,
            amount: ocrData.ocr_result.amount || 10000,
            beneficiary_account: '0123456789',
            beneficiary_bank: '058',
            beneficiary_name: 'Chidi Okafor',
            narration: `Fuel reimbursement - ${ocrData.ocr_result.vendor_name || 'Receipt'}`,
          }),
        });

        if (!transferResponse.ok) {
          throw new Error('Transfer failed');
        }

        const xferData = await transferResponse.json();
        setTransferResult(xferData.transfer);
      }

      setStage('complete');
      toast.success('Workflow completed successfully!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      toast.error(message);
      setStage('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStage('upload');
    setError(null);
    setFile(null);
    setReceiptId(null);
    setOcrResult(null);
    setTrustReport(null);
    setRunId(null);
    setTransferResult(null);
  };

  return (
    <div className="min-h-screen bg-surface-0 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Wotmind Demo
          </h1>
          <p className="text-text-secondary">
            Upload a fuel receipt and watch the intelligent workflow execute:
            OCR extraction → Trust verification → Squad transfer
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-between mb-12">
          {(['upload', 'ocr', 'trust', 'transfer', 'complete'] as const).map(
            (s, i) => (
              <div key={s} className="flex items-center">
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    stage === s || (['ocr', 'trust', 'transfer', 'complete'].includes(stage) && i < (['upload', 'ocr', 'trust', 'transfer', 'complete'] as const).indexOf(stage as any))
                      ? 'bg-border-glow text-surface-0'
                      : 'bg-surface-2 text-text-secondary'
                  }`}
                  animate={{
                    scale:
                      stage === s
                        ? 1.1
                        : ['ocr', 'trust', 'transfer', 'complete'].includes(
                              stage
                            ) &&
                            i <
                              (['upload', 'ocr', 'trust', 'transfer', 'complete'] as const).indexOf(
                                stage as any
                              )
                        ? 1
                        : 0.95,
                  }}
                >
                  {i + 1}
                </motion.div>
                {i < 4 && (
                  <div
                    className={`w-12 h-0.5 ml-2 transition-colors ${
                      (['ocr', 'trust', 'transfer', 'complete'].includes(
                        stage
                      ) &&
                        i <
                          (['upload', 'ocr', 'trust', 'transfer', 'complete'] as const).indexOf(
                            stage as any
                          ))
                        ? 'bg-border-glow'
                        : 'bg-surface-2'
                    }`}
                  />
                )}
              </div>
            )
          )}
        </div>

        {/* Stage labels */}
        <div className="flex justify-between mb-12 text-xs text-text-secondary">
          <span>Upload</span>
          <span>OCR</span>
          <span>Trust</span>
          <span>Transfer</span>
          <span>Complete</span>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-accent-red/10 border border-accent-red rounded-lg flex gap-3"
            >
              <AlertCircle className="w-5 h-5 text-accent-red flex-shrink-0" />
              <div>
                <p className="font-medium text-accent-red">Error</p>
                <p className="text-sm text-accent-red/80">{error}</p>
              </div>
            </motion.div>
          )}

          {stage === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <UploadZone
                onFileSelect={handleFileSelect}
                isLoading={isLoading}
              />
            </motion.div>
          )}

          {stage === 'ocr' && ocrResult && (
            <motion.div
              key="ocr"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {isLoading ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <Spinner size="lg" />
                      <p className="text-text-secondary">
                        Analyzing receipt with Gemini...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <OcrResult result={ocrResult} />
                  <p className="text-sm text-text-secondary italic">
                    Running trust verification...
                  </p>
                </>
              )}
            </motion.div>
          )}

          {stage === 'trust' && trustReport && (
            <motion.div
              key="trust"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {isLoading ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <Spinner size="lg" />
                      <p className="text-text-secondary">
                        Running parallel trust checks...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <TrustDashboard report={trustReport} />
                  {trustReport.verdict === 'approved' && (
                    <p className="text-sm text-text-secondary italic">
                      Initiating Squad transfer...
                    </p>
                  )}
                </>
              )}
            </motion.div>
          )}

          {stage === 'transfer' && transferResult && (
            <motion.div
              key="transfer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-accent-amber">
                    Transfer Initiated
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-text-secondary uppercase tracking-wide">
                        Squad Reference
                      </label>
                      <p className="text-sm font-mono text-text-primary mt-1">
                        {transferResult.squad_reference.slice(0, 20)}...
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-text-secondary uppercase tracking-wide">
                        Amount
                      </label>
                      <p className="text-lg font-bold text-accent-amber">
                        ₦{transferResult.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-surface-2 rounded text-sm text-text-secondary">
                    Transfer is processing in Squad sandbox. Check the audit
                    log for real-time updates.
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {stage === 'complete' && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center space-y-6"
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1 }}>
                <CheckCircle className="w-16 h-16 text-accent-green mx-auto" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Workflow Complete!
                </h2>
                <p className="text-text-secondary">
                  Receipt uploaded, verified, and transfer initiated
                  successfully.
                </p>
              </div>
              <Button
                onClick={reset}
                variant="primary"
                size="lg"
                className="mx-auto"
              >
                Run Another Demo
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
