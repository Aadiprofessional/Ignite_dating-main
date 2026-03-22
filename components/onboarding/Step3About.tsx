'use client';

import React, { useMemo, useState } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Lightbulb, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/lib/store';

const HONG_KONG_UNIVERSITIES = [
  'The University of Hong Kong',
  'The Chinese University of Hong Kong',
  'The Hong Kong University of Science and Technology',
  'City University of Hong Kong',
  'The Hong Kong Polytechnic University',
  'Hong Kong Baptist University',
  'Lingnan University',
  'The Education University of Hong Kong',
  'Hong Kong Metropolitan University',
  'Hong Kong Shue Yan University',
  'The Hang Seng University of Hong Kong',
  'Chu Hai College of Higher Education',
  'HKU SPACE',
  'Caritas Institute of Higher Education',
  'Saint Francis University',
];

type UniversityItem = {
  id: string;
  name: string;
  city: string;
  country: string;
};

const UNIVERSITY_WORDS_TO_IGNORE = new Set(['the', 'of', 'and', 'university', 'college', 'institute']);
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function Step3About() {
  const { data, updateData, nextStep, prevStep } = useOnboarding();
  const { universities, searchUniversities, uploadVerificationDocument } = useStore();
  const [showTips, setShowTips] = useState(false);
  const [showUniversityList, setShowUniversityList] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [universityError, setUniversityError] = useState<string | null>(null);

  const maxLength = 300;
  const currentLength = data.bio.length;
  const isNearLimit = currentLength >= maxLength * 0.8;

  const tips = [
    "What's a non-negotiable for you?",
    "Your ideal Sunday morning?",
    "A skill you're currently learning?",
    "The most spontaneous thing you've done?",
  ];

  React.useEffect(() => {
    void searchUniversities('hong kong');
  }, [searchUniversities]);

  React.useEffect(() => {
    if (data.universityQuery.trim().length < 2) return;
    const timeout = setTimeout(() => {
      void searchUniversities(data.universityQuery.trim());
    }, 300);
    return () => clearTimeout(timeout);
  }, [data.universityQuery, searchUniversities]);

  const hkUniversities = useMemo<UniversityItem[]>(() => {
    const keywords = ['hong kong', 'hku', 'hkust', 'cityu', 'polyu', 'lingnan', 'eduhk', 'hkbu'];
    const byKeyword = universities.filter((university) => {
      const text = `${university.name} ${university.city} ${university.country}`.toLowerCase();
      return keywords.some((keyword) => text.includes(keyword));
    });
    const fallbackUniversities = HONG_KONG_UNIVERSITIES.map((name) => ({
      id: '',
      name,
      city: 'Hong Kong',
      country: 'Hong Kong',
    }));
    const merged = [...fallbackUniversities, ...(byKeyword.length ? byKeyword : universities)];
    const unique = new Map<string, UniversityItem>();
    for (const university of merged) {
      const key = university.name.toLowerCase();
      const existing = unique.get(key);
      if (!existing || (!existing.id && university.id)) {
        unique.set(key, university);
      }
    }
    return Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [universities]);

  const filteredUniversities = useMemo(() => {
    const query = data.universityQuery.trim().toLowerCase();
    if (!query) return hkUniversities;
    return hkUniversities.filter((university) => university.name.toLowerCase().includes(query));
  }, [data.universityQuery, hkUniversities]);

  const normalizeUniversityName = (name: string) =>
    name
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const tokenizeUniversityName = (name: string) =>
    normalizeUniversityName(name)
      .split(' ')
      .map((token) => token.trim())
      .filter((token) => token && !UNIVERSITY_WORDS_TO_IGNORE.has(token));

  const resolveUniversityId = async (name: string) => {
    const searchQuery = name.trim() || 'hong kong';
    const [directMatches, hkMatches] = await Promise.all([
      searchUniversities(searchQuery),
      searchUniversities('hong kong'),
    ]);
    const merged = [...directMatches, ...hkMatches, ...universities];
    const byKey = new Map<string, UniversityItem>();
    for (const university of merged) {
      const key = (university.id || university.name).toLowerCase();
      if (!byKey.has(key)) byKey.set(key, university);
    }
    const serverUniversities = Array.from(byKey.values()).filter((university) => Boolean(university.id));
    if (!serverUniversities.length) return null;

    const normalizedQuery = normalizeUniversityName(searchQuery);
    const exactMatch = serverUniversities.find((university) => normalizeUniversityName(university.name) === normalizedQuery);
    if (exactMatch) return exactMatch;

    const containsMatch = serverUniversities.find((university) => {
      const normalizedName = normalizeUniversityName(university.name);
      return normalizedName.includes(normalizedQuery) || normalizedQuery.includes(normalizedName);
    });
    if (containsMatch) return containsMatch;

    const tokens = tokenizeUniversityName(searchQuery);
    let bestMatch: UniversityItem | null = null;
    let bestScore = 0;
    for (const university of serverUniversities) {
      const normalizedName = normalizeUniversityName(university.name);
      const score = tokens.reduce((total, token) => (normalizedName.includes(token) ? total + 1 : total), 0);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = university;
      }
    }
    return bestScore > 0 ? bestMatch : null;
  };

  const handleDocumentPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setIsUploadingDocument(true);
    try {
      const url = await uploadVerificationDocument(file);
      updateData({
        verificationDocumentUrl: url,
        verificationDocumentName: file.name,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to upload document.';
      setUploadError(message);
    } finally {
      setIsUploadingDocument(false);
      event.target.value = '';
    }
  };

  const handleNextStep = async () => {
    if (UUID_REGEX.test(data.universityId.trim())) {
      setUniversityError(null);
      nextStep();
      return;
    }

    const queryRaw = data.universityQuery.trim();
    const query = queryRaw.toLowerCase();
    if (!queryRaw) {
      setUniversityError('Please enter your university name.');
      return;
    }
    if (data.universityName && query === data.universityName.trim().toLowerCase()) {
      const selectedFromServerList = hkUniversities.find(
        (university) => university.name.toLowerCase() === query && university.id
      );
      if (selectedFromServerList?.id && UUID_REGEX.test(selectedFromServerList.id)) {
        updateData({
          universityId: selectedFromServerList.id,
          universityName: selectedFromServerList.name,
          universityQuery: selectedFromServerList.name,
        });
        setUniversityError(null);
        nextStep();
        return;
      }
      const resolvedSelectedUniversity = await resolveUniversityId(data.universityName);
      if (resolvedSelectedUniversity?.id && UUID_REGEX.test(resolvedSelectedUniversity.id)) {
        updateData({
          universityId: resolvedSelectedUniversity.id,
          universityName: resolvedSelectedUniversity.name,
          universityQuery: resolvedSelectedUniversity.name,
        });
        setUniversityError(null);
        nextStep();
        return;
      }
      updateData({
        universityId: '',
        universityName: data.universityName.trim(),
        universityQuery: data.universityName.trim(),
      });
      setUniversityError(null);
      nextStep();
      return;
    }
    const localExactMatch = hkUniversities.find(
      (university) => university.name.toLowerCase() === query && UUID_REGEX.test(university.id)
    );
    if (localExactMatch) {
      updateData({
        universityId: localExactMatch.id,
        universityName: localExactMatch.name,
        universityQuery: localExactMatch.name,
      });
      setUniversityError(null);
      nextStep();
      return;
    }

    const matchedUniversityFromList = filteredUniversities.find((university) => university.name.toLowerCase() === query);
    const matchedUniversity = await resolveUniversityId(matchedUniversityFromList?.name || data.universityQuery);

    if (matchedUniversity?.id && UUID_REGEX.test(matchedUniversity.id)) {
      updateData({
        universityId: matchedUniversity.id,
        universityName: matchedUniversity.name,
        universityQuery: matchedUniversity.name,
      });
    } else {
      updateData({
        universityId: '',
        universityName: queryRaw,
        universityQuery: queryRaw,
      });
    }
    setUniversityError(null);
    nextStep();
  };

  return (
    <div className="flex flex-col h-full max-w-md mx-auto w-full">
      <div className="mb-6">
        <h2 className="text-4xl font-serif font-bold text-offwhite mb-2">About You</h2>
        <p className="text-zinc-400 font-mono text-sm">Tell us what makes you tick.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-zinc-400 font-mono text-xs uppercase flex justify-between">
            <span>Bio</span>
            <button
              onClick={() => setShowTips(!showTips)}
              className="flex items-center gap-1 text-crimson hover:text-crimson/80 transition-colors"
            >
              <Lightbulb size={14} />
              <span className="text-[10px]">Writing Tips</span>
              {showTips ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </Label>

          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-2"
              >
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-400 italic">
                  <p className="mb-1 font-semibold text-zinc-300">Try answering:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <textarea
              value={data.bio}
              onChange={(e) => updateData({ bio: e.target.value.slice(0, maxLength) })}
              className="w-full h-32 bg-black/40 backdrop-blur-md border border-zinc-700 rounded-xl p-4 text-white placeholder-zinc-600 focus:outline-none focus:border-crimson transition-colors resize-none"
              placeholder="I'm a designer who loves coffee and..."
            />
            <div
              className={cn(
                "absolute bottom-3 right-3 text-xs font-mono transition-colors",
                isNearLimit ? "text-crimson" : "text-zinc-500"
              )}
            >
              {currentLength}/{maxLength}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-400 font-mono text-xs uppercase">Occupation</Label>
            <Input
              value={data.occupation}
              onChange={(e) => updateData({ occupation: e.target.value })}
              className="bg-transparent border-zinc-700 focus:border-crimson text-white"
              placeholder="Product Designer"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-400 font-mono text-xs uppercase">Education</Label>
            <Input
              value={data.education}
              onChange={(e) => updateData({ education: e.target.value })}
              className="bg-transparent border-zinc-700 focus:border-crimson text-white"
              placeholder="University of Design"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400 font-mono text-xs uppercase">Search University (Hong Kong)</Label>
          <Input
            value={data.universityQuery}
            onFocus={() => setShowUniversityList(true)}
            onBlur={() => {
              setTimeout(() => {
                setShowUniversityList(false);
              }, 150);
            }}
            onChange={(event) => {
              updateData({
                universityQuery: event.target.value,
                universityId: '',
                universityName: '',
              });
              setUniversityError(null);
              setShowUniversityList(true);
            }}
            className="bg-transparent border-zinc-700 focus:border-crimson text-white"
            placeholder="Search university"
          />
          {showUniversityList ? (
            <div className="max-h-48 overflow-auto rounded-xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-sm relative z-50">
              {filteredUniversities.map((university) => (
                <button
                  key={university.id || university.name}
                  onClick={async () => {
                    setUniversityError(null);
                    updateData({
                      universityId: university.id || '',
                      universityName: university.name,
                      universityQuery: university.name,
                    });
                    const resolvedUniversity =
                      university.id
                        ? university
                        : await resolveUniversityId(university.name);
                    if (resolvedUniversity?.id) {
                      updateData({
                        universityId: resolvedUniversity.id,
                        universityName: resolvedUniversity.name,
                        universityQuery: resolvedUniversity.name,
                      });
                    }
                    setShowUniversityList(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  {university.name}
                </button>
              ))}
              {filteredUniversities.length === 0 ? (
                <div className="px-4 py-3 text-sm text-zinc-400">No universities found.</div>
              ) : null}
            </div>
          ) : null}
          {data.universityName ? <p className="text-xs text-zinc-400">Selected: {data.universityName}</p> : null}
          {!data.universityId && data.universityName ? (
            <p className="text-xs text-zinc-500">This will be submitted as a custom university.</p>
          ) : null}
          {universityError ? <p className="text-xs text-crimson">{universityError}</p> : null}
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400 font-mono text-xs uppercase">Phone Number</Label>
          <Input
            type="tel"
            value={data.phoneNumber}
            onChange={(event) => updateData({ phoneNumber: event.target.value })}
            className="bg-transparent border-zinc-700 focus:border-crimson text-white"
            placeholder="+85291234567"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-zinc-400 font-mono text-xs uppercase">Verification Document</Label>
          <label className="w-full h-11 rounded-xl border border-zinc-700 px-4 text-sm text-zinc-200 bg-black/40 flex items-center justify-between cursor-pointer hover:border-crimson transition-colors">
            <span>{data.verificationDocumentName || 'Choose file (image or PDF)'}</span>
            <span className="inline-flex items-center gap-2 text-crimson">
              <Upload size={14} />
              <span>{isUploadingDocument ? 'Uploading...' : 'Select file'}</span>
            </span>
            <input
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(event) => void handleDocumentPick(event)}
              disabled={isUploadingDocument}
            />
          </label>
          {data.verificationDocumentUrl ? <p className="text-xs text-zinc-400">Document uploaded successfully.</p> : null}
          {uploadError ? <p className="text-xs text-crimson">{uploadError}</p> : null}
        </div>
      </div>

      <div className="mt-auto flex justify-between pt-8">
        <Button
          variant="ghost"
          onClick={prevStep}
          className="text-zinc-400 hover:text-white font-mono"
        >
          Back
        </Button>
        <Button
          onClick={() => void handleNextStep()}
          disabled={
            !data.bio.trim() ||
            !data.occupation.trim() ||
            !data.universityQuery.trim() ||
            !data.phoneNumber.trim() ||
            !data.verificationDocumentUrl ||
            isUploadingDocument
          }
          className="bg-crimson hover:bg-crimson/90 text-white font-mono px-8"
        >
          Next Step
        </Button>
      </div>
    </div>
  );
}
