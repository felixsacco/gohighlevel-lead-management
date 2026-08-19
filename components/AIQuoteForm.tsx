'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useReCaptcha } from '@/components/ReCaptchaProvider';
import nspell from 'nspell';
import { X, ChevronLeft, ChevronRight, Upload, Clock, MapPin, Wrench, FileText, Calculator, ShieldCheck, Star, Mail, Send } from 'lucide-react';

function levenshtein(a: string, b: string): number {
  const an = a.length, bn = b.length;
  const matrix: number[][] = Array.from({ length: an + 1 }, () => Array(bn + 1).fill(0));
  for (let i = 0; i <= an; i++) matrix[i][0] = i;
  for (let j = 0; j <= bn; j++) matrix[0][j] = j;
  for (let i = 1; i <= an; i++) {
    for (let j = 1; j <= bn; j++) {
      matrix[i][j] = a[i - 1] === b[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]) + 1;
    }
  }
  return matrix[an][bn];
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface QuoteFormData {
  trade: string;
  description: string;
  postcode: string;
  urgency: string;
  availability: string;
  images: File[];
  firstName: string;
  lastName: string;
  clientEmail: string;
  clientPhone: string;
}

const trades = [
  'Plumber',
  'Electrician',
  'Builder',
  'Painter',
  'Roofer',
  'Gardener',
  'Tiler',
  'Carpenter',
  'Locksmith',
  'Cleaner',
  'Handyman',
  'Plasterer',
  'Flooring',
  'Kitchen Fitter',
  'Bathroom Fitter',
  'Window Cleaner',
  'Pest Control',
  'Appliance Repair',
  'HVAC',
  'Decorator',
  'Driveway',
  'Fencing',
  'Guttering',
  'Insulation',
  'Gas Engineer',
  'Window Fitter',
  'Solar Panel Installer',
  'Other'
];

const urgencyOptions = [
  { value: 'emergency', label: 'Emergency (Same day)', icon: '🚨' },
  { value: 'urgent', label: 'Urgent (Within 24 hours)', icon: '⚡' },
  { value: 'normal', label: 'Normal (Within a week)', icon: '📅' },
  { value: 'flexible', label: 'Flexible (No rush)', icon: '😌' }
];

interface AIQuoteFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrade?: string;
  initialPostcode?: string;
}

export default function AIQuoteForm({ isOpen, onClose, initialTrade = '', initialPostcode = '' }: AIQuoteFormProps) {
  const [currentStep, setCurrentStep] = useState(initialTrade ? 2 : 1);
  const [formData, setFormData] = useState<QuoteFormData>({
    trade: initialTrade,
    description: '',
    postcode: initialPostcode,
    urgency: '',
    availability: '',
    images: [],
    firstName: '',
    lastName: '',
    clientEmail: '',
    clientPhone: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedJob, setSubmittedJob] = useState<{ jobId: string; jobRef?: string; status: string; message: string } | null>(null);
  const [estimate, setEstimate] = useState<string | null>(null);
  const [estimateMin, setEstimateMin] = useState<number | null>(null);
  const [estimateMax, setEstimateMax] = useState<number | null>(null);
  const [estimateRange, setEstimateRange] = useState<string | null>(null);
  const [estimateBreakdown, setEstimateBreakdown] = useState<{
    regionName?: string;
    complexityLevel?: string;
    time?: string;
  } | null>(null);
  const [estimateDisclaimer, setEstimateDisclaimer] = useState<string | null>(null);
  const [postcodeError, setPostcodeError] = useState<string | null>(null);
  const [descWordCount, setDescWordCount] = useState(0);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [spellChecker, setSpellChecker] = useState<any>(null);
  const prefetchStarted = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { execute } = useReCaptcha();

  const steps = [
    { number: 1, title: 'Select Trade', icon: Wrench },
    { number: 2, title: 'Describe Job', icon: FileText },
    { number: 3, title: 'Location & Timing', icon: MapPin },
    { number: 4, title: 'Estimate + Submit', icon: Calculator },
  ];

  const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i;

  const validatePostcode = (pc: string): boolean => {
    const cleaned = pc.replace(/\s+/g, '').toUpperCase();
    if (cleaned.length < 5 || cleaned.length > 7) return false;
    return ukPostcodeRegex.test(pc);
  };

  const handleInputChange = (field: keyof QuoteFormData, value: string | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'postcode') {
      const v = value as string;
      if (v && !validatePostcode(v)) {
        setPostcodeError('Please enter a valid UK postcode (e.g. SW1A 1AA)');
      } else {
        setPostcodeError(null);
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      images: prev.images.filter((_, i) => i !== index) 
    }));
  };

  const nextStep = async () => {
    // Step 2: require minimum 10 words
    if (currentStep === 2) {
      const words = formData.description.trim().split(/\s+/).filter(w => w.length > 0);
      if (words.length < 10) return;
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateEstimate = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsPrefetching(true);
    try {
      // reCAPTCHA bot protection
      const token = await execute('estimate');
      if (token) {
        const verifyRes = await fetch('/api/recaptcha/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) {
          if (!silent) alert('We could not verify you are human. Please try again.');
          setIsLoading(false);
          setIsPrefetching(false);
          return;
        }
      }

      // Call AI estimate API
      const response = await fetch('/api/estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: formData.description,
          trade: formData.trade,
          postcode: formData.postcode,
          urgency: formData.urgency || 'normal',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get estimate');
      }

      const data = await response.json();
      setEstimate(data.estimate || '£200');
      if (typeof data.min === "number" && typeof data.max === "number") {
        setEstimateMin(data.min);
        setEstimateMax(data.max);
        setEstimateRange(`Typical range: £${data.min}–£${data.max}`);
      } else {
        setEstimateMin(null);
        setEstimateMax(null);
        setEstimateRange(null);
      }
      if (data.breakdown || data.aiBreakdown) {
        const bd = data.aiBreakdown || data.breakdown;
        setEstimateBreakdown({
          regionName: bd?.region?.name,
          complexityLevel: bd?.complexity?.level,
          time: bd?.time,
        });
      } else {
        setEstimateBreakdown(null);
      }
      setEstimateDisclaimer(
        typeof data.disclaimer === "string" ? data.disclaimer : null,
      );
    } catch (error) {
      console.error('Error generating estimate:', error);
      // Fallback to default estimate
      setEstimate('£200');
      setEstimateRange('Typical range: £180–£260');
      setEstimateBreakdown(null);
      setEstimateDisclaimer(null);
    } finally {
      setIsLoading(false);
      setIsPrefetching(false);
    }
  };

  // Prefetch estimate when user is on step 3 and has entered a valid postcode
  useEffect(() => {
    const postcodeValid = formData.postcode && !postcodeError && validatePostcode(formData.postcode);
    if (currentStep === 3 && postcodeValid && !estimate && !isLoading && !isPrefetching && !prefetchStarted.current) {
      prefetchStarted.current = true;
      generateEstimate(true);
    }
  }, [currentStep, formData.postcode, postcodeError]);

  // Lazy-load en-GB dictionary from static assets on step 2 (description box).
  // The .dic file is several hundred KB — fetch only when the user reaches the
  // description step, never in the initial page payload.
  useEffect(() => {
    if (currentStep < 2 || spellChecker) return;
    let cancelled = false;
    (async () => {
      try {
        const [aff, dic] = await Promise.all([
          fetch('/dictionaries/en-gb.aff').then(r => { if (!r.ok) throw new Error(`aff fetch ${r.status}`); return r.text(); }),
          fetch('/dictionaries/en-gb.dic').then(r => { if (!r.ok) throw new Error(`dic fetch ${r.status}`); return r.text(); }),
        ]);
        if (cancelled) return;
        const checker = nspell(aff, dic);
        // Add UK trade term whitelist
        const tradeTerms = ['RCD', 'RCBO', 'combi', 'soffit', 'fascia', 'screed', 'skim', 'architrave', 'gulley', 'downpipe', 'spur', 'EICR'];
        const multiWordTerms = ['consumer unit', 'Gas Safe', 'ring main', 'fuse board', 'NICEIC', 'NAPIT'];
        for (const term of tradeTerms) {
          checker.add(term.toLowerCase());
        }
        for (const term of multiWordTerms) {
          for (const word of term.split(/\s+/)) {
            checker.add(word.toLowerCase());
          }
        }
        setSpellChecker(checker);
      } catch (err) {
        console.warn('Spellcheck unavailable — dictionary fetch failed:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [currentStep, spellChecker]);

  // Auto-correct description on space/punctuation after a completed word
  const lastCorrectedDesc = useRef<string>('');
  const lastCorrectedText = useRef<string>('');
  const handleDescriptionChange = useCallback((value: string) => {
    const prev = formData.description;
    setFormData(prev => ({ ...prev, description: value }));
    setDescWordCount(value.trim().split(/\s+/).filter(w => w.length > 0).length);
    if (!spellChecker) return;

    // Only correct when a space or punctuation was just typed
    const diffStart = (() => {
      for (let i = 0; i < value.length && i < prev.length; i++) {
        if (value[i] !== prev[i]) return i;
      }
      return Math.min(prev.length, value.length);
    })();

    if (value.length <= prev.length) {
      lastCorrectedText.current = value;
      return;
    }

    const lastChar = value[value.length - 1];
    const isWordBoundary = lastChar === ' ' || ['.', ',', '!', '?', ';', ':'].includes(lastChar);
    if (!isWordBoundary) {
      lastCorrectedText.current = value;
      return;
    }

    // Find the word that just ended
    const textBefore = value.slice(0, -1);
    const wordMatch = textBefore.match(/(\S+)$/);
    if (!wordMatch) { lastCorrectedText.current = value; return; }
    const word = wordMatch[1];

    // Never correct capitalized words
    if (/^[A-Z]/.test(word)) { lastCorrectedText.current = value; return; }
    // Skip numbers/symbols
    if (!/^[a-z]/i.test(word)) { lastCorrectedText.current = value; return; }

    // Only correct when single suggestion at edit distance 1
    if (!spellChecker.correct(word)) {
      const suggestions = spellChecker.suggest(word);
      if (suggestions.length === 1 && suggestions[0].toLowerCase() !== word.toLowerCase()) {
        const suggestion = suggestions[0];
        // Preserve case: follow the case pattern of original word
        const editDist = levenshtein(word.toLowerCase(), suggestion.toLowerCase());
        if (editDist === 1) {
          const before = value.slice(0, value.length - 1 - word.length);
          const after = value.slice(value.length - 1);
          const corrected = before + suggestion + after;
          lastCorrectedDesc.current = word;
          lastCorrectedText.current = corrected;
          setFormData(prev => ({ ...prev, description: corrected }));
          setDescWordCount(corrected.trim().split(/\s+/).filter(w => w.length > 0).length);
          return;
        }
      }
    }
    lastCorrectedText.current = value;
  }, [formData.description, spellChecker]);

  // Ctrl+Z undo for last correction
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z' && lastCorrectedDesc.current) {
        const corrected = lastCorrectedDesc.current;
        const current = formData.description;
        const idx = current.indexOf(corrected);
        // Only undo if the corrected word is present and the text hasn't been heavily modified
        if (idx !== -1 && lastCorrectedText.current === current) {
          e.preventDefault();
          const before = current.slice(0, idx);
          const after = current.slice(idx + corrected.length);
          const undone = before + corrected + after; // revert to original misspelling
          setFormData(prev => ({ ...prev, description: undone }));
          setDescWordCount(undone.trim().split(/\s+/).filter(w => w.length > 0).length);
          lastCorrectedText.current = undone;
          lastCorrectedDesc.current = '';
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [formData.description]);
  useEffect(() => {
    if (currentStep < 4) {
      prefetchStarted.current = false;
    }
  }, [currentStep]);

  // Auto-generate estimate when landing on step 4 (fallback if prefetch didn't happen)
  useEffect(() => {
    if (currentStep === 4 && !estimate && !isLoading && !isPrefetching) {
      prefetchStarted.current = true;
      generateEstimate(false);
    }
  }, [currentStep]);

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.clientEmail || !formData.clientPhone) return;
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/jobs/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trade: formData.trade,
          description: formData.description,
          postcode: formData.postcode,
          urgency: formData.urgency,
          budget: estimate || null,
          estimateLabel: estimate || null,
          breakdownTime: estimateBreakdown?.time || null,
          budgetMin: estimateMin || null,
          budgetMax: estimateMax || null,
          budgetType: 'fixed',
          preferredDate: formData.availability || 'Flexible',
          images: [],
          firstName: formData.firstName,
          lastName: formData.lastName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSubmittedJob({
          jobId: data.data.jobId,
          jobRef: data.data.jobRef,
          status: data.data.status,
          message: data.data.message,
        });
      } else {
        alert(data.message || 'Failed to submit job. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting job:', error);
      alert('Failed to submit job. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-10">
              <h3 className="text-4xl font-extrabold text-[#1A3A8A] mb-4" style={{fontWeight: 800}}>
                What service do you need?
              </h3>
              <p className="text-xl text-gray-600 mb-6">Select the type of <span className="text-[#1A3A8A] font-bold">trade</span> you are looking for</p>
            </div>
            
            <div>
              <label className="block text-base font-bold text-[#1A3A8A] mb-3" style={{fontWeight: 700}}>
                Trade Category <span className="text-red-500">*</span>
              </label>
              <Select value={formData.trade} onValueChange={(value) => handleInputChange('trade', value)}>
                <SelectTrigger className="w-full h-14 text-lg border-2 border-gray-300 focus:border-[#F5B301] rounded-xl">
                  <SelectValue placeholder="e.g. Plumber, Electrician, Builder" />
                </SelectTrigger>
                <SelectContent side="bottom" sideOffset={8} className="max-h-[300px] overflow-y-auto custom-dropdown-scroll">
                  {trades.map((trade) => (
                    <SelectItem key={trade} value={trade} className="text-base">
                      {trade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Professional Trust Indicators */}
              <div className="mt-6 p-5 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#1A3A8A] flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">Identity-checked pros</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="w-5 h-5 text-[#F5B301] flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">Customer reviewed</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#1A3A8A] flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">Under 60s</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#1A3A8A] flex-shrink-0" />
                    <div className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">Public liability insured</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4 md:space-y-6"
          >
            <div className="text-center mb-4 md:mb-6">
              <h3 className="text-2xl md:text-3xl font-extrabold text-[#1A3A8A] mb-2 md:mb-3" style={{fontWeight: 800}}>
                Describe your job
              </h3>
              <p className="text-base md:text-lg text-gray-600">Tell us what you need done in detail</p>
            </div>
            
            <div>
              <label className="block text-sm md:text-base font-bold text-[#1A3A8A] mb-2 md:mb-3" style={{fontWeight: 700}}>
                Job Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                placeholder="Describe the work you need done in detail..."
                className="min-h-[100px] md:min-h-[120px] text-base border-2 border-gray-300 focus:border-[#F5B301] rounded-xl p-3 md:p-4"
              />
            </div>

            <div>
              <label className="block text-sm md:text-base font-bold text-[#1A3A8A] mb-2 md:mb-3" style={{fontWeight: 700}}>
                Upload Images (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 md:p-6 text-center hover:border-[#F5B301] hover:bg-[#F5B301]/5 transition-all cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Click to upload images or drag and drop
                </p>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 text-sm md:text-base py-2 md:py-3"
                >
                  Choose Files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-base font-bold text-[#1A3A8A] mb-3" style={{fontWeight: 700}}>
                Urgency Level <span className="text-red-500">*</span>
              </label>
              <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                <SelectTrigger className="w-full h-14 text-lg border-2 border-gray-300 focus:border-[#F5B301] rounded-xl">
                  <SelectValue placeholder="Select urgency level..." />
                </SelectTrigger>
                <SelectContent side="bottom" sideOffset={8}>
                  {urgencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <span className="mr-2">{option.icon}</span>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Word count indicator */}
            {descWordCount > 0 && (
              <p className={`text-sm mt-3 ${
                descWordCount >= 10 ? 'text-green-600' : 'text-amber-600'
              }`}>
                {descWordCount}/10 words{descWordCount < 10 ? ' — please add more detail' : ''}
              </p>
            )}
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-extrabold text-[#1A3A8A] mb-3" style={{fontWeight: 800}}>
                Location & <span className="text-[#F5B301]">Availability</span>
              </h3>
              <p className="text-lg text-gray-600">Where and when do you need the work done?</p>
            </div>
            
            <div>
              <label className="block text-base font-bold text-[#1A3A8A] mb-3" style={{fontWeight: 700}}>
                Postcode <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                <Input
                  value={formData.postcode}
                  onChange={(e) => handleInputChange('postcode', e.target.value.toUpperCase())}
                  placeholder="Enter your postcode"
                  className={`pl-14 h-14 text-lg border-2 rounded-xl ${
                    postcodeError ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-[#F5B301]'
                  }`}
                />
              </div>
              {postcodeError && (
                <p className="text-red-500 text-sm mt-1.5 ml-1">{postcodeError}</p>
              )}
            </div>

            <div>
              <label className="block text-base font-bold text-[#1A3A8A] mb-3" style={{fontWeight: 700}}>
                Preferred Availability
              </label>
              <div className="grid grid-cols-2 gap-4">
                {['Morning', 'Afternoon', 'Evening', 'Flexible'].map((time) => (
                  <Button
                    key={time}
                    variant={formData.availability === time ? 'default' : 'outline'}
                    onClick={() => handleInputChange('availability', time)}
                    className={`h-14 text-base font-bold border-2 rounded-xl transition-all ${
                      formData.availability === time 
                        ? 'bg-[#F5B301] hover:bg-[#E8A900] text-black border-[#F5B301]' 
                        : 'border-gray-300 hover:border-[#1A3A8A] hover:bg-gray-50'
                    }`}
                    style={{fontWeight: 700}}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 4: {
        // Show confirmation inline when job is submitted
        if (submittedJob) {
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-9 h-9 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-extrabold text-[#1A3A8A]" style={{fontWeight: 800}}>
                Job Submitted!
              </h3>
              <p className="text-base text-gray-600 max-w-md mx-auto">
                Your job has been submitted successfully and is now live for tradespeople.
                A tradesperson will be in contact shortly.
              </p>

              <Card className="border-2 border-gray-200 text-left shadow-sm">
                <CardContent className="p-5 space-y-3">
                  <h4 className="text-base font-bold text-[#1A3A8A]" style={{fontWeight: 700}}>Job Summary</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="text-gray-500">Trade</div>
                    <div className="font-semibold text-gray-900">{formData.trade}</div>
                    <div className="text-gray-500">Location</div>
                    <div className="font-semibold text-gray-900">{formData.postcode}</div>
                    <div className="text-gray-500">Urgency</div>
                    <div className="font-semibold text-gray-900">{urgencyOptions.find(u => u.value === formData.urgency)?.label || formData.urgency}</div>
                    <div className="text-gray-500">Reference</div>
                    <div className="font-semibold text-gray-900 font-mono text-xs">{submittedJob.jobRef || submittedJob.jobId}</div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-left">
                <h4 className="text-base font-bold text-[#1A3A8A] mb-3" style={{fontWeight: 700}}>What happens next?</h4>
                {estimateBreakdown?.time && (
                  <p className="text-sm text-gray-700 mb-3">
                    <span className="font-semibold">Estimated response time: </span>
                    {estimateBreakdown.time}
                  </p>
                )}
                <ul className="space-y-3 text-sm text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-[#1A3A8A] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>Your job is now live and visible to verified tradespeople in your area.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-[#1A3A8A] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>Matched tradespeople will be notified and can express interest in your job.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-[#1A3A8A] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>A tradesperson will be in contact with you shortly. You'll also receive email updates.</span>
                  </li>
                </ul>
              </div>

              <Button
                onClick={onClose}
                className="bg-[#F5B301] hover:bg-[#E8A900] text-black font-bold px-8 py-3 text-base shadow-md"
                style={{fontWeight: 800}}
              >
                Close
              </Button>
            </motion.div>
          );
        }

        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Job Summary Card — merged from old standalone step */}
            <div className="text-center mb-4">
              <h3 className="text-2xl md:text-3xl font-extrabold text-[#1A3A8A] mb-2" style={{fontWeight: 800}}>
                Job <span className="text-[#F5B301]">Summary</span>
              </h3>
              <p className="text-sm md:text-base text-gray-600">Review your job details before submitting</p>
            </div>

            <Card className="border-2 border-gray-200 shadow-sm">
              <CardContent className="p-5 md:p-6 space-y-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm md:text-base">
                  <div className="text-gray-500 font-medium">Trade</div>
                  <div className="font-bold text-gray-900">{formData.trade}</div>

                  <div className="text-gray-500 font-medium">Urgency</div>
                  <div className="font-bold text-gray-900">
                    {urgencyOptions.find(u => u.value === formData.urgency)?.label || formData.urgency}
                  </div>

                  <div className="text-gray-500 font-medium">Postcode</div>
                  <div className="font-bold text-gray-900">{formData.postcode}</div>

                  <div className="text-gray-500 font-medium">Availability</div>
                  <div className="font-bold text-gray-900">{formData.availability || 'Flexible'}</div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-gray-500 font-medium text-sm mb-2">Job Description</div>
                  <p className="text-sm md:text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                    {formData.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Estimate Section */}
            <div className="text-center mb-8">
              <h3 className="text-3xl font-extrabold text-[#1A3A8A] mb-3" style={{fontWeight: 800}}>
                Your AI <span className="text-[#F5B301]">Estimate</span>
              </h3>
              <p className="text-lg text-gray-600">Based on your job details and location</p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating your estimate...</p>
              </div>
            ) : estimate ? (
              <Card className="border-2 border-[#F5B301] bg-gradient-to-br from-[#F5B301]/10 to-[#E8A900]/10">
                <CardContent className="p-6 md:p-10 text-center">
                  <div className="text-5xl md:text-7xl font-extrabold text-[#1A3A8A] mb-4" style={{fontWeight: 800}}>
                    {estimate}
                  </div>
                  <p className="text-lg md:text-xl text-gray-700 mb-6 font-semibold">
                    Estimated cost for your {formData.trade.toLowerCase()} job
                  </p>
                  {estimateRange ? (
                    <p className="text-base text-gray-600 mb-6">{estimateRange}</p>
                  ) : null}

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Trade:</strong> {formData.trade}
                    </div>
                    <div>
                      <strong>Urgency:</strong> {urgencyOptions.find(u => u.value === formData.urgency)?.label}
                    </div>
                    <div>
                      <strong>Location:</strong> {formData.postcode}
                    </div>
                    <div>
                      <strong>Availability:</strong> {formData.availability || 'Flexible'}
                    </div>
                    <div>
                      <strong>Region:</strong> {estimateBreakdown?.regionName || 'UK baseline'}
                    </div>
                    <div>
                      <strong>Complexity:</strong> {estimateBreakdown?.complexityLevel || 'Assessed from description'}
                    </div>
                  </div>
                  {estimateDisclaimer ? (
                    <p className="mt-6 text-left text-sm text-gray-600 max-w-xl mx-auto border-t pt-4">
                      {estimateDisclaimer}
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600">Preparing your estimate…</p>
              </div>
            )}

            {estimate && (
              <div className="space-y-5 border-t pt-6">
                <div className="text-center">
                  <h3 className="text-xl font-extrabold text-[#1A3A8A] mb-1" style={{fontWeight: 800}}>
                    Your Details
                  </h3>
                  <p className="text-sm text-gray-600">Enter your contact info to submit the job</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-[#1A3A8A] mb-1.5" style={{fontWeight: 700}}>
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="First name"
                      className="h-12 text-base border-2 border-gray-300 focus:border-[#F5B301] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#1A3A8A] mb-1.5" style={{fontWeight: 700}}>
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="Last name"
                      className="h-12 text-base border-2 border-gray-300 focus:border-[#F5B301] rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A3A8A] mb-1.5" style={{fontWeight: 700}}>
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 text-base border-2 border-gray-300 focus:border-[#F5B301] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#1A3A8A] mb-1.5" style={{fontWeight: 700}}>
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                    placeholder="+44 7000 000000"
                    className="h-12 text-base border-2 border-gray-300 focus:border-[#F5B301] rounded-xl"
                  />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-sm text-gray-600">
                    By submitting, you agree to be contacted by verified tradespeople regarding your job.
                  </p>
                </div>

              </div>
            )}
          </motion.div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] md:max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header - Navy Background */}
            <div className="bg-[#1A3A8A] text-white px-4 md:px-8 py-4 md:py-6 rounded-t-3xl flex-shrink-0">
              <div className="relative flex items-center justify-center mb-4 md:mb-6">
                <img src="/logo-text.svg" alt="MyApproved" className="h-12 md:h-16 w-auto" />
                <button
                  onClick={onClose}
                  className="absolute right-0 text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6 md:w-7 md:h-7" />
                </button>
              </div>
              
              {/* Progress Steps - Gold/White */}
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div className={`flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full text-sm md:text-base font-extrabold transition-all ${
                        currentStep >= step.number 
                          ? 'bg-[#F5B301] text-black shadow-lg md:scale-110' 
                          : 'bg-white/20 text-white/60'
                      }`} style={{fontWeight: 800}}>
                        {step.number}
                      </div>
                      <span className={`text-[10px] md:text-xs mt-1 md:mt-2 font-medium text-center leading-tight ${
                        currentStep >= step.number ? 'text-[#F5B301]' : 'text-white/60'
                      }`}>
                        {step.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`h-0.5 md:h-1 flex-1 mx-1 md:mx-2 rounded-full transition-all ${
                        currentStep > step.number ? 'bg-[#F5B301]' : 'bg-white/20'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 min-h-0">
              {renderStep()}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-4 md:px-8 py-4 md:py-6 rounded-b-3xl flex-shrink-0">
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1 || (currentStep === 4 && !!submittedJob) || isSubmitting}
                  className="flex items-center border-2 border-gray-300 hover:border-[#1A3A8A] px-4 md:px-6 py-3 md:py-6 text-sm md:text-base font-bold disabled:opacity-40"
                  style={{fontWeight: 700}}
                >
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
                  Previous
                </Button>

                {currentStep < 4 && (
                  <Button
                    onClick={nextStep}
                    disabled={
                      (currentStep === 1 && !formData.trade) ||
                      (currentStep === 2 && (!formData.description || !formData.urgency || descWordCount < 10)) ||
                      (currentStep === 3 && (!formData.postcode || !!postcodeError))
                    }
                    className="bg-[#F5B301] hover:bg-[#E8A900] text-black font-bold px-4 md:px-8 py-3 md:py-6 text-sm md:text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed border-2 border-[#F5B301]"
                    style={{fontWeight: 800}}
                  >
                    Next Step
                    <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
                  </Button>
                )}

                {currentStep === 4 && !submittedJob && (
                  <Button
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      !formData.firstName ||
                      !formData.lastName ||
                      !formData.clientEmail ||
                      !formData.clientPhone
                    }
                    className="bg-[#1A3A8A] hover:bg-[#2563eb] text-white font-bold px-8 py-6 text-base shadow-lg hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{fontWeight: 800}}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Submit Job
                      </>
                    )}
                  </Button>
                )}

                {currentStep === 4 && submittedJob && (
                  <div />
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 