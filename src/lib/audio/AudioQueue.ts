// src/lib/audio/AudioQueue.ts
// NUR Lingo Audio Engine — Playback Queue Management

import { AudioQueueItem, AudioPlayOptions, LanguageCode, AudioProviderType } from "./AudioTypes";

type QueueEventHandler = (event: { type: string; item?: AudioQueueItem; error?: Error }) => void;

/**
 * Manages a queue of audio playback items
 * Ensures only one audio plays at a time
 */
export class AudioQueue {
  private queue: AudioQueueItem[] = [];
  private current: AudioQueueItem | null = null;
  private queueIdCounter = 0;
  private handlers: Set<QueueEventHandler> = new Set();

  /**
   * Add item to the queue
   */
  enqueue(
    text: string,
    lang: LanguageCode,
    options: AudioPlayOptions = {},
    priority = 0
  ): string {
    const queueId = `queue_${++this.queueIdCounter}`;

    const item: AudioQueueItem = {
      queueId,
      text,
      lang,
      audioId: options.id,
      options,
      priority,
      addedAt: Date.now(),
    };

    // Insert in priority order
    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      if (this.queue[i].priority < priority) {
        insertIndex = i;
        break;
      }
    }

    this.queue.splice(insertIndex, 0, item);
    this.emit({ type: "enqueue", item });

    return queueId;
  }

  /**
   * Add item to front of queue (high priority)
   */
  enqueueFront(text: string, lang: LanguageCode, options: AudioPlayOptions = {}): string {
    return this.enqueue(text, lang, options, 100);
  }

  /**
   * Get the next item from queue
   */
  dequeue(): AudioQueueItem | null {
    if (this.queue.length === 0) return null;
    return this.queue.shift() ?? null;
  }

  /**
   * Peek at next item without removing
   */
  peek(): AudioQueueItem | null {
    return this.queue[0] ?? null;
  }

  /**
   * Get current playing item
   */
  getCurrent(): AudioQueueItem | null {
    return this.current;
  }

  /**
   * Set current playing item
   */
  setCurrent(item: AudioQueueItem | null): void {
    this.current = item;
    if (item) {
      item.onPlay?.();
    }
  }

  /**
   * Clear current without playing next
   */
  clearCurrent(): void {
    this.current = null;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  /**
   * Get queue length
   */
  get length(): number {
    return this.queue.length;
  }

  /**
   * Check if currently playing
   */
  isPlaying(): boolean {
    return this.current !== null;
  }

  /**
   * Remove item from queue by ID
   */
  remove(queueId: string): boolean {
    const index = this.queue.findIndex((item) => item.queueId === queueId);
    if (index !== -1) {
      const [removed] = this.queue.splice(index, 1);
      this.emit({ type: "remove", item: removed });
      return true;
    }
    return false;
  }

  /**
   * Clear entire queue
   */
  clear(): void {
    this.queue = [];
    this.current = null;
    this.emit({ type: "clear" });
  }

  /**
   * Get all queue items
   */
  getAll(): AudioQueueItem[] {
    return [...this.queue];
  }

  /**
   * Find item by queue ID
   */
  find(queueId: string): AudioQueueItem | undefined {
    return this.queue.find((item) => item.queueId === queueId);
  }

  /**
   * Update priority of an item
   */
  updatePriority(queueId: string, priority: number): boolean {
    const index = this.queue.findIndex((item) => item.queueId === queueId);
    if (index === -1) return false;

    const [item] = this.queue.splice(index, 1);
    item.priority = priority;

    // Re-insert in priority order
    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      if (this.queue[i].priority < priority) {
        insertIndex = i;
        break;
      }
    }
    this.queue.splice(insertIndex, 0, item);

    return true;
  }

  /**
   * Subscribe to queue events
   */
  subscribe(handler: QueueEventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  /**
   * Emit queue event
   */
  private emit(event: Parameters<QueueEventHandler>[0]): void {
    for (const handler of this.handlers) {
      handler(event);
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    length: number;
    hasCurrent: boolean;
    highPriority: number;
    normalPriority: number;
    lowPriority: number;
  } {
    let highPriority = 0;
    let normalPriority = 0;
    let lowPriority = 0;

    for (const item of this.queue) {
      if (item.priority >= 50) highPriority++;
      else if (item.priority >= 0) normalPriority++;
      else lowPriority++;
    }

    return {
      length: this.queue.length,
      hasCurrent: this.current !== null,
      highPriority,
      normalPriority,
      lowPriority,
    };
  }
}

// Singleton instance
export const audioQueue = new AudioQueue();
