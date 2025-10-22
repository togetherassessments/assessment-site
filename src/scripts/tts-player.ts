// tts-player.ts - Dead simple TTS implementation

type PlayerState = 'idle' | 'playing' | 'paused';

export class TTSPlayer {
  // Voice priority list extracted from temp/priority-voices.json
  // Voices are ordered by priority: en-GB > female > quality > en-US > other English
  // Each entry includes altNames for platform-specific voice matching (Android, Chrome OS, etc.)
  // Lower score = higher priority
  private static readonly VOICE_PRIORITY: ReadonlyArray<{ name: string; altNames: readonly string[]; score: number }> =
    [
      { name: 'Microsoft Sonia Online (Natural) - English (United Kingdom)', altNames: [], score: 0 },
      { name: 'Microsoft Libby Online (Natural) - English (United Kingdom)', altNames: [], score: 1 },
      { name: 'Google UK English Female', altNames: [], score: 2 },
      {
        name: 'Google UK English 2 (Natural)',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-gb-x-gba-network',
          'Chrome OS UK English 2',
          'Android Speech Recognition and Synthesis from Google en-gb-x-gba-local',
          'Android Speech Recognition and Synthesis from Google en-GB-language',
        ],
        score: 3,
      },
      {
        name: 'Google UK English 4 (Natural)',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-gb-x-gbc-network',
          'Chrome OS UK English 4',
          'Android Speech Recognition and Synthesis from Google en-gb-x-gbc-local',
        ],
        score: 4,
      },
      {
        name: 'Google UK English 6 (Natural)',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-gb-x-gbg-network',
          'Chrome OS UK English 6',
          'Android Speech Recognition and Synthesis from Google en-gb-x-gbg-local',
        ],
        score: 5,
      },
      { name: 'Serena', altNames: [], score: 6 },
      { name: 'Microsoft Hazel - English (Great Britain)', altNames: [], score: 7 },
      { name: 'Microsoft Susan - English (Great Britain)', altNames: [], score: 8 },
      { name: 'Kate', altNames: [], score: 9 },
      { name: 'Stephanie', altNames: [], score: 10 },
      { name: 'Fiona', altNames: [], score: 11 },
      { name: 'Chrome OS UK English 7', altNames: [], score: 12 },
      { name: 'Martha', altNames: [], score: 13 },
      { name: 'Microsoft Maisie Online (Natural) - English (United Kingdom)', altNames: [], score: 15 },
      { name: 'Microsoft Ryan Online (Natural) - English (United Kingdom)', altNames: [], score: 16 },
      { name: 'Microsoft Thomas Online (Natural) - English (United Kingdom)', altNames: [], score: 17 },
      { name: 'Google UK English Male', altNames: [], score: 18 },
      {
        name: 'Google UK English 1 (Natural)',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-gb-x-rjs-network',
          'Chrome OS UK English 1',
          'Android Speech Recognition and Synthesis from Google en-gb-x-rjs-local',
        ],
        score: 19,
      },
      {
        name: 'Google UK English 3 (Natural)',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-gb-x-gbb-network',
          'Chrome OS UK English 3',
          'Android Speech Recognition and Synthesis from Google en-gb-x-gbb-local',
        ],
        score: 20,
      },
      {
        name: 'Google UK English 5 (Natural)',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-gb-x-gbd-network',
          'Chrome OS UK English 5',
          'Android Speech Recognition and Synthesis from Google en-gb-x-gbd-local',
        ],
        score: 21,
      },
      { name: 'Jamie', altNames: [], score: 22 },
      { name: 'Daniel', altNames: [], score: 23 },
      { name: 'Microsoft George - English (Great Britain)', altNames: [], score: 24 },
      { name: 'Oliver', altNames: [], score: 25 },
      { name: 'Arthur', altNames: [], score: 26 },
      {
        name: 'Microsoft EmmaMultilingual Online (Natural) - English (United States)',
        altNames: ['Microsoft Emma Online (Natural) - English (United States)'],
        score: 27,
      },
      {
        name: 'Microsoft AvaMultilingual Online (Natural) - English (United States)',
        altNames: ['Microsoft Ava Online (Natural) - English (United States)'],
        score: 28,
      },
      { name: 'Microsoft Jenny Online (Natural) - English (United States)', altNames: [], score: 29 },
      { name: 'Microsoft Aria Online (Natural) - English (United States)', altNames: [], score: 30 },
      { name: 'Microsoft Michelle Online (Natural) - English (United States)', altNames: [], score: 31 },
      { name: 'Google US English', altNames: [], score: 32 },
      {
        name: 'Google US English 5 (Natural)',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-us-x-tpc-network',
          'Chrome OS US English 5',
          'Android Speech Recognition and Synthesis from Google en-us-x-tpc-local',
          'Android Speech Recognition and Synthesis from Google en-US-language',
        ],
        score: 33,
      },
      {
        name: 'Google US English 1 (Natural)',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-us-x-iob-network',
          'Chrome OS US English 1',
          'Android Speech Recognition and Synthesis from Google en-us-x-iob-local',
        ],
        score: 34,
      },
      {
        name: 'Google US English 2 (Natural)',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-us-x-iog-network',
          'Chrome OS US English 2',
          'Android Speech Recognition and Synthesis from Google en-us-x-iog-local',
        ],
        score: 35,
      },
      {
        name: 'Google US English 7 (Natural)',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-us-x-tpf-network',
          'Chrome OS US English 7',
          'Android Speech Recognition and Synthesis from Google en-us-x-tpf-local',
        ],
        score: 36,
      },
      { name: 'Ava', altNames: [], score: 37 },
      { name: 'Zoe', altNames: [], score: 38 },
      { name: 'Samantha', altNames: [], score: 39 },
      { name: 'Microsoft Zira - English (United States)', altNames: [], score: 40 },
      {
        name: 'Android Speech Recognition and Synthesis from Google en-us-x-sfg-network',
        altNames: ['Android Speech Recognition and Synthesis from Google en-us-x-sfg-local'],
        score: 41,
      },
      { name: 'Allison', altNames: [], score: 42 },
      { name: 'Chrome OS US English 8', altNames: [], score: 43 },
      { name: 'Nicky', altNames: [], score: 44 },
      { name: 'Microsoft Natasha Online (Natural) - English (Australia)', altNames: [], score: 45 },
      { name: 'Microsoft Hayley Online - English (Australia)', altNames: [], score: 46 },
      { name: 'Microsoft Clara Online (Natural) - English (Canada)', altNames: [], score: 47 },
      { name: 'Microsoft Heather Online - English (Canada)', altNames: [], score: 48 },
      {
        name: 'Microsoft Neerja Online (Natural) - English (India)',
        altNames: ['Microsoft Neerja Online (Natural) - English (India) (Preview)'],
        score: 49,
      },
      { name: 'Microsoft Emily Online (Natural) - English (Ireland)', altNames: [], score: 50 },
      { name: 'Microsoft Leah Online (Natural) - English (South Africa)', altNames: [], score: 51 },
      { name: 'Microsoft Yan Online (Natural) - English (Hong Kong SAR)', altNames: [], score: 52 },
      { name: 'Microsoft Asilia Online (Natural) - English (Kenya)', altNames: [], score: 53 },
      { name: 'Microsoft Molly Online (Natural) - English (New Zealand)', altNames: [], score: 54 },
      { name: 'Microsoft Ezinne Online (Natural) - English (Nigeria)', altNames: [], score: 55 },
      { name: 'Microsoft Rosa Online (Natural) - English (Philippines)', altNames: [], score: 56 },
      { name: 'Microsoft Luna Online (Natural) - English (Singapore)', altNames: [], score: 57 },
      { name: 'Microsoft Imani Online (Natural) - English (Tanzania)', altNames: [], score: 58 },
      { name: 'Karen', altNames: [], score: 59 },
      {
        name: 'Google Australian English 1 (Natural)',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-au-x-aua-network',
          'Chrome OS Australian English 1',
          'Android Speech Recognition and Synthesis from Google en-au-x-aua-local',
          'Android Speech Recognition and Synthesis from Google en-AU-language',
        ],
        score: 60,
      },
      {
        name: 'Google Australian English 3 (Natural)',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-au-x-auc-network',
          'Chrome OS Australian English 3',
          'Android Speech Recognition and Synthesis from Google en-au-x-auc-local',
        ],
        score: 61,
      },
      {
        name: 'Google Australian English 2 (Natural)',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-au-x-aub-network',
          'Chrome OS Australian English 2',
          'Android Speech Recognition and Synthesis from Google en-au-x-aub-local',
        ],
        score: 62,
      },
      {
        name: 'Google Australian English 4 (Natural)',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-au-x-aud-network',
          'Chrome OS Australian English 4',
          'Android Speech Recognition and Synthesis from Google en-au-x-aud-local',
        ],
        score: 63,
      },
      {
        name: 'Android Speech Recognition and Synthesis from Google en-in-x-ena-network',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-in-x-ena-local',
          'Android Speech Recognition and Synthesis from Google en-IN-language',
        ],
        score: 64,
      },
      {
        name: 'Android Speech Recognition and Synthesis from Google en-in-x-enc-network',
        altNames: ['Android Speech Recognition and Synthesis from Google en-in-x-enc-local'],
        score: 65,
      },
      { name: 'Matilda', altNames: [], score: 66 },
      { name: 'Isha', altNames: [], score: 67 },
      { name: 'Microsoft Catherine - English (Austalia)', altNames: [], score: 68 },
      { name: 'Microsoft Linda - English (Canada)', altNames: [], score: 69 },
      { name: 'Microsoft Heera - English (India)', altNames: [], score: 70 },
      { name: 'Sangeeta', altNames: [], score: 71 },
      { name: 'Moira', altNames: [], score: 72 },
      { name: 'Tessa', altNames: [], score: 73 },
      { name: 'Catherine', altNames: [], score: 74 },
      { name: 'Microsoft Ana Online (Natural) - English (United States)', altNames: [], score: 75 },
      { name: 'Joelle', altNames: [], score: 76 },
      {
        name: 'Microsoft AndrewMultilingual Online (Natural) - English (United States)',
        altNames: ['Microsoft Andrew Online (Natural) - English (United States)'],
        score: 77,
      },
      {
        name: 'Microsoft BrianMultilingual Online (Natural) - English (United States)',
        altNames: ['Microsoft Brian Online (Natural) - English (United States)'],
        score: 78,
      },
      { name: 'Microsoft Guy Online (Natural) - English (United States)', altNames: [], score: 79 },
      { name: 'Microsoft Eric Online (Natural) - English (United States)', altNames: [], score: 80 },
      { name: 'Microsoft Steffan Online (Natural) - English (United States)', altNames: [], score: 81 },
      { name: 'Microsoft Christopher Online (Natural) - English (United States)', altNames: [], score: 82 },
      { name: 'Microsoft Roger Online (Natural) - English (United States)', altNames: [], score: 83 },
      {
        name: 'Google US English 4 (Natural)',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-us-x-iom-network',
          'Chrome OS US English 4',
          'Android Speech Recognition and Synthesis from Google en-us-x-iom-local',
        ],
        score: 84,
      },
      {
        name: 'Google US English 3 (Natural)',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-us-x-iol-network',
          'Chrome OS US English 3',
          'Android Speech Recognition and Synthesis from Google en-us-x-iol-local',
        ],
        score: 85,
      },
      {
        name: 'Google US English 6 (Natural)',
        altNames: [
          'Android Speech Recognition and Synthesis from Google en-us-x-tpd-network',
          'Chrome OS US English 6',
          'Android Speech Recognition and Synthesis from Google en-us-x-tpd-local',
        ],
        score: 86,
      },
      { name: 'Alex', altNames: [], score: 87 },
      { name: 'Microsoft David - English (United States)', altNames: [], score: 88 },
      { name: 'Microsoft Mark - English (United States)', altNames: [], score: 89 },
      { name: 'Evan', altNames: [], score: 90 },
      { name: 'Nathan', altNames: [], score: 91 },
      { name: 'Tom', altNames: [], score: 92 },
      { name: 'Aaron', altNames: [], score: 93 },
      { name: 'Microsoft William Online (Natural) - English (Australia)', altNames: [], score: 94 },
      { name: 'Microsoft Liam Online (Natural) - English (Canada)', altNames: [], score: 95 },
      { name: 'Microsoft Prabhat Online (Natural) - English (India)', altNames: [], score: 96 },
      { name: 'Microsoft Connor Online (Natural) - English (Ireland)', altNames: [], score: 97 },
      { name: 'Microsoft Luke Online (Natural) - English (South Africa)', altNames: [], score: 98 },
      { name: 'Microsoft Sam Online (Natural) - English (Hongkong)', altNames: [], score: 99 },
      { name: 'Microsoft Chilemba Online (Natural) - English (Kenya)', altNames: [], score: 100 },
      { name: 'Microsoft Mitchell Online (Natural) - English (New Zealand)', altNames: [], score: 101 },
      { name: 'Microsoft Abeo Online (Natural) - English (Nigeria)', altNames: [], score: 102 },
      { name: 'Microsoft James Online (Natural) - English (Philippines)', altNames: [], score: 103 },
      { name: 'Microsoft Wayne Online (Natural) - English (Singapore)', altNames: [], score: 104 },
      { name: 'Microsoft Elimu Online (Natural) - English (Tanzania)', altNames: [], score: 105 },
      { name: 'Chrome OS Australian English 5', altNames: [], score: 106 },
      {
        name: 'Android Speech Recognition and Synthesis from Google en-in-x-end-network',
        altNames: ['Android Speech Recognition and Synthesis from Google en-in-x-end-local'],
        score: 107,
      },
      {
        name: 'Android Speech Recognition and Synthesis from Google en-in-x-ene-network',
        altNames: ['Android Speech Recognition and Synthesis from Google en-in-x-ene-local'],
        score: 108,
      },
      { name: 'Lee', altNames: [], score: 109 },
      { name: 'Rishi', altNames: [], score: 110 },
      { name: 'Microsoft Richard - English (Australia)', altNames: [], score: 111 },
      { name: 'Microsoft Richard - English (Canada)', altNames: [], score: 112 },
      { name: 'Microsoft Ravi - English (India)', altNames: [], score: 113 },
      { name: 'Microsoft Sean - English (Ireland)', altNames: [], score: 114 },
      { name: 'Gordon', altNames: [], score: 115 },
    ];

  private synthesis: SpeechSynthesis;
  private utterance: SpeechSynthesisUtterance | null = null;
  private state: PlayerState = 'idle';
  private voicesLoaded: boolean = false;

  // Multi-chunk support for long content
  private contentChunks: string[] = [];
  private currentChunkIndex: number = 0;

  // Getter that queries DOM fresh each time (Astro navigation can replace elements)
  private get playerElement(): HTMLElement {
    const el = document.getElementById('tts-player');
    if (!el) {
      throw new Error('TTS player element not found');
    }
    return el;
  }

  constructor() {
    // Check browser support
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech not supported in your browser.');
      throw new Error('SpeechSynthesis not supported');
    }

    this.synthesis = window.speechSynthesis;

    // CRITICAL: Cancel any existing speech from previous session
    this.synthesis.cancel();

    // Load voices (they may not be available immediately)
    // Set up voiceschanged event listener for browsers that load voices async
    this.synthesis.addEventListener('voiceschanged', () => {
      this.voicesLoaded = true;
    });

    // Try to load voices immediately (works in Firefox, fails in Chrome)
    const voices = this.synthesis.getVoices();
    if (voices.length > 0) {
      this.voicesLoaded = true;
    }

    // Verify player element exists (but don't cache it)
    // This will throw if not found
    void this.playerElement;

    // Set up event listeners
    this.setupUI();

    // Store globally for Astro navigation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).ttsPlayer = this;
  }

  public async start(): Promise<void> {
    // If already playing, don't restart
    if (this.state === 'playing') {
      return;
    }

    // Wait for voices to load if they haven't yet (Chrome race condition fix)
    if (!this.voicesLoaded) {
      await this.waitForVoices();
    }

    // Extract content
    const content = this.extractContent();

    if (!content || content.trim().length === 0) {
      alert('No content found to read aloud.');
      return;
    }

    // CHROME WORKAROUND: Split content into chunks to avoid 4000 character limit
    // Chrome has an undocumented limit that causes silent failure on long utterances
    const maxChunkLength = 500;

    if (content.length > maxChunkLength) {
      this.contentChunks = this.splitIntoChunks(content, maxChunkLength);
      this.currentChunkIndex = 0;
    } else {
      // Single chunk
      this.contentChunks = [content];
      this.currentChunkIndex = 0;
    }

    // Start speaking the first chunk
    this.speakCurrentChunk();
    this.state = 'playing';

    // Show player
    this.openPlayer();
  }

  public pause(): void {
    if (this.state === 'playing') {
      this.synthesis.pause();
      this.state = 'paused';
      this.updateUI();
    }
  }

  public resume(): void {
    if (this.state === 'paused') {
      this.synthesis.resume();
      this.state = 'playing';
      this.updateUI();
    }
  }

  public stop(): void {
    this.synthesis.cancel();
    this.state = 'idle';
    this.utterance = null;
    this.currentChunkIndex = 0; // Reset chunk position
    this.contentChunks = [];
    this.updateUI();
  }

  public close(): void {
    this.stop();
    this.closePlayer();
  }

  public togglePlayPause(): void {
    if (this.state === 'playing') {
      this.pause();
    } else if (this.state === 'paused') {
      this.resume();
    } else if (this.state === 'idle') {
      this.start();
    }
  }

  public isPlaying(): boolean {
    return this.state === 'playing';
  }

  public updateContent(): void {
    // Called after navigation - stop current playback and close player
    if (this.state !== 'idle') {
      this.stop();
      this.closePlayer();
    }
  }

  // PRIVATE METHODS

  /**
   * Split content into chunks at sentence boundaries
   * Ensures chunks don't exceed maxLength and break at natural pauses
   */
  private splitIntoChunks(content: string, maxLength: number): string[] {
    const chunks: string[] = [];
    let currentChunk = '';

    // Split on sentence boundaries (period, exclamation, question mark followed by space)
    const sentences = content.split(/([.!?]+\s+)/);

    for (let i = 0; i < sentences.length; i += 2) {
      const sentence = sentences[i] + (sentences[i + 1] || '');

      if (currentChunk.length + sentence.length <= maxLength) {
        currentChunk += sentence;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
        }

        // If single sentence exceeds limit, split it further at commas
        if (sentence.length > maxLength) {
          const parts = sentence.split(/([,;:]\s+)/);
          let part = '';
          for (let j = 0; j < parts.length; j += 2) {
            const segment = parts[j] + (parts[j + 1] || '');
            if (part.length + segment.length <= maxLength) {
              part += segment;
            } else {
              if (part) chunks.push(part.trim());
              part = segment;
            }
          }
          currentChunk = part;
        } else {
          currentChunk = sentence;
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Speak the current chunk and set up event handlers
   */
  private speakCurrentChunk(): void {
    if (this.currentChunkIndex >= this.contentChunks.length) {
      // Finished all chunks
      this.onEnd();
      return;
    }

    const chunkText = this.contentChunks[this.currentChunkIndex];

    // Create utterance for this chunk
    this.utterance = new SpeechSynthesisUtterance(chunkText);
    this.utterance.rate = 1.0;

    // Select voice
    const selectedVoice = this.selectPreferredVoice();
    if (selectedVoice) {
      this.utterance.voice = selectedVoice;
    }

    // Set up event handlers
    this.utterance.onstart = () => {
      if (this.currentChunkIndex === 0) {
        // First chunk starting
        this.onStart();
      }
    };

    this.utterance.onend = () => {
      // Move to next chunk
      this.currentChunkIndex++;
      if (this.currentChunkIndex < this.contentChunks.length) {
        // More chunks to speak
        this.speakCurrentChunk();
      } else {
        // All chunks complete
        this.onEnd();
      }
    };

    this.utterance.onpause = () => {
      this.onPause();
    };

    this.utterance.onresume = () => {
      this.onResume();
    };

    this.utterance.onerror = (e) => {
      this.onError(e);
    };

    // Start speaking this chunk
    this.synthesis.speak(this.utterance);
  }

  private waitForVoices(): Promise<void> {
    return new Promise((resolve) => {
      // If voices are already loaded, resolve immediately
      if (this.voicesLoaded) {
        resolve();
        return;
      }

      // Wait for voiceschanged event (max 2 seconds timeout)
      const timeout = setTimeout(() => {
        resolve();
      }, 2000);

      const handler = () => {
        clearTimeout(timeout);
        this.voicesLoaded = true;
        resolve();
      };

      this.synthesis.addEventListener('voiceschanged', handler, { once: true });
    });
  }

  /**
   * Calculate fallback score for voices not in VOICE_PRIORITY list
   * Lower score = higher priority
   */
  private calculateFallbackScore(voice: SpeechSynthesisVoice): number {
    let score = 0;
    const lang = voice.lang.toLowerCase();
    const name = voice.name.toLowerCase();

    // Language priority (lower score = higher priority)
    if (lang.startsWith('en-gb')) {
      score = 0; // Highest priority
    } else if (lang.startsWith('en-us')) {
      score = 1000;
    } else if (lang.startsWith('en')) {
      score = 2000;
    } else {
      score = 5000; // Non-English fallback
    }

    // Gender preference (subtract to boost priority)
    if (name.includes('female')) {
      score -= 500;
    }

    // Preferred name bonus
    const preferredNames = ['serena', 'kate', 'susan', 'fiona', 'stephanie', 'sonia', 'libby'];
    for (let i = 0; i < preferredNames.length; i++) {
      if (name.includes(preferredNames[i])) {
        score -= 100 - i * 10; // Earlier names get bigger bonus
        break;
      }
    }

    return score;
  }

  /**
   * Select the preferred voice using priority-based scoring
   * Uses VOICE_PRIORITY list for deterministic selection
   * Falls back to intelligent scoring for unknown voices
   */
  private selectPreferredVoice(): SpeechSynthesisVoice | null {
    const allVoices = this.synthesis.getVoices();

    if (allVoices.length === 0) {
      return null;
    }

    // Filter to only en-GB and en-US voices
    const englishVoices = allVoices.filter((voice) => {
      const lang = voice.lang.toLowerCase();
      return lang.startsWith('en-gb') || lang.startsWith('en-us');
    });

    // Fallback: if no en-GB/en-US voices, accept any English voice
    const voices =
      englishVoices.length > 0 ? englishVoices : allVoices.filter((v) => v.lang.toLowerCase().startsWith('en'));

    if (voices.length === 0) {
      return null;
    }

    // Group voices by name, preferring en-GB over en-US for duplicates
    const voicesByName = new Map<string, SpeechSynthesisVoice>();

    for (const voice of voices) {
      const existing = voicesByName.get(voice.name);
      if (!existing) {
        voicesByName.set(voice.name, voice);
      } else {
        // If we have a duplicate name, prefer en-GB over en-US
        const existingLang = existing.lang.toLowerCase();
        const voiceLang = voice.lang.toLowerCase();

        if (voiceLang.startsWith('en-gb') && !existingLang.startsWith('en-gb')) {
          voicesByName.set(voice.name, voice);
        }
        // Otherwise keep existing (en-GB or first encountered)
      }
    }

    const uniqueVoices = Array.from(voicesByName.values());

    // Score each unique voice by priority
    let bestVoice: SpeechSynthesisVoice | null = null;
    let bestScore = Infinity;

    for (const voice of uniqueVoices) {
      // Check if voice is in our priority list (match by name OR altNames)
      const priorityEntry = TTSPlayer.VOICE_PRIORITY.find(
        (pv) => pv.name === voice.name || pv.altNames.includes(voice.name)
      );

      let score: number;
      if (priorityEntry) {
        // Voice found in priority list - use its score
        score = priorityEntry.score;
      } else {
        // Voice not in priority list - use fallback scoring
        // Add large offset to ensure priority list voices always win
        score = 10000 + this.calculateFallbackScore(voice);
      }

      if (score < bestScore) {
        bestScore = score;
        bestVoice = voice;
      }
    }

    return bestVoice;
  }

  private extractContent(): string {
    const main =
      document.querySelector('main') || document.querySelector('[role="main"]') || document.querySelector('article');

    if (!main) {
      return '';
    }

    // Clone the main element so we can modify it without affecting the page
    const clone = main.cloneNode(true) as HTMLElement;

    // Remove UI chrome elements (blacklist approach)
    const skipSelector =
      'nav, header, footer, aside, .tts-player, [aria-hidden="true"], [hidden], button, form, input, select, textarea, .toggle-menu, .accessibility-toggle';
    const elementsToRemove = clone.querySelectorAll(skipSelector);
    elementsToRemove.forEach((el) => el.remove());

    // Use TreeWalker to traverse all text nodes and their parent elements
    // This captures ALL text while respecting block boundaries for natural pauses
    const texts: string[] = [];
    const processedElements = new Set<Element>();

    // Walk the DOM tree to find all elements with direct text content
    const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const text = node.textContent?.trim();
        return text && text.length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      },
    });

    let node: Node | null;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || processedElements.has(parent)) continue;

      // Get the parent element's direct text (not nested children)
      const text = parent.textContent?.trim();
      if (!text || text.length === 0) continue;

      processedElements.add(parent);

      // Add period if the text doesn't end with punctuation
      if (!/[.!?,;:]$/.test(text)) {
        texts.push(text + '.');
      } else {
        texts.push(text);
      }
    }

    // Deduplicate identical text strings (in case of odd HTML structures)
    const uniqueTexts = Array.from(new Set(texts));

    return uniqueTexts.join(' ');
  }

  private setupUI(): void {
    // Play/Pause
    const playPauseBtn = this.playerElement.querySelector('.tts-play-pause');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => {
        this.togglePlayPause();
      });
    }

    // Stop
    const stopBtn = this.playerElement.querySelector('.tts-stop');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        this.stop();
      });
    }

    // Close
    const closeBtn = this.playerElement.querySelector('.tts-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.close();
      });
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.playerElement.getAttribute('aria-hidden') === 'false') {
        this.close();
      }
    });
  }

  private openPlayer(): void {
    this.playerElement.setAttribute('aria-hidden', 'false');
    // Start collapsed to minimize obstruction
    this.playerElement.setAttribute('data-collapsed', 'true');
    // Update UI immediately when opening
    this.updateUI();
  }

  private closePlayer(): void {
    this.playerElement.setAttribute('aria-hidden', 'true');
  }

  private updateUI(): void {
    // Update play/pause button
    const playPauseBtn = this.playerElement.querySelector('.tts-play-pause');

    if (playPauseBtn) {
      if (this.state === 'playing') {
        playPauseBtn.setAttribute('aria-label', 'Pause');
        playPauseBtn.setAttribute('aria-pressed', 'true');
        // Update screen reader text
        const srText = playPauseBtn.querySelector('.sr-only');
        if (srText) srText.textContent = 'Pause';
      } else {
        playPauseBtn.setAttribute('aria-label', 'Play');
        playPauseBtn.setAttribute('aria-pressed', 'false');
        // Update screen reader text
        const srText = playPauseBtn.querySelector('.sr-only');
        if (srText) srText.textContent = 'Play';
      }
    }

    // Update status text in both full player and tab
    const statusEl = this.playerElement.querySelector('#tts-status');
    const tabStatusEl = this.playerElement.querySelector('#tts-tab-status');

    let statusText = 'Stopped';
    if (this.state === 'playing') {
      statusText = 'Listening to Page';
    } else if (this.state === 'paused') {
      statusText = 'Paused';
    }

    if (statusEl) {
      statusEl.textContent = statusText;
    }

    // Update tab with shorter text
    if (tabStatusEl) {
      if (this.state === 'playing') {
        tabStatusEl.textContent = 'Listening';
      } else if (this.state === 'paused') {
        tabStatusEl.textContent = 'Paused';
      } else {
        tabStatusEl.textContent = 'Stopped';
      }
    }
  }

  private onStart(): void {
    this.state = 'playing';
    this.updateUI();
    this.announce('Playing');
  }

  private onEnd(): void {
    this.state = 'idle';
    this.updateUI();
    this.announce('Finished reading');
  }

  private onPause(): void {
    this.state = 'paused';
    this.updateUI();
    this.announce('Paused');
  }

  private onResume(): void {
    this.state = 'playing';
    this.updateUI();
    this.announce('Playing');
  }

  private onError(event: SpeechSynthesisErrorEvent): void {
    // "interrupted" is not an error - it happens when user stops playback
    if (event.error === 'interrupted') {
      this.state = 'idle';
      this.updateUI();
      return;
    }

    // Log actual errors
    console.error('TTS Error:', event.error);
    this.announce(`Error: ${event.error}`);
    this.state = 'idle';
    this.updateUI();
  }

  private announce(message: string): void {
    const statusRegion = this.playerElement.querySelector('[role="status"]');
    if (statusRegion) {
      statusRegion.textContent = message;

      setTimeout(() => {
        statusRegion.textContent = '';
      }, 1000);
    }
  }
}
