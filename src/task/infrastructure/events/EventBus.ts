import { Injectable } from '@nestjs/common';
import { IEventBus } from '../../application/ports/IEventBus';
import { DomainEvent } from '../../domain/events/DomainEvent';
import { IEventStore } from '../../application/ports/IEventStore';
import { Result } from '@/shared/core/Result';

export class EventBus implements IEventBus {
  private handlers: Map<string, Array<(event: DomainEvent) => Promise<Result<void>>>> = new Map();

  constructor(private eventStore: IEventStore) {}

  async publish<T extends DomainEvent>(event: T): Promise<Result<void>> {
    try {
      // 이벤트 저장
      await this.eventStore.save(event);

      // 등록된 핸들러들 실행
      const handlers = this.handlers.get(event.eventType) || [];
      await Promise.all(handlers.map(handler => handler(event)));

      return Result.ok();
    } catch (error) {
      return Result.fail(`Failed to publish event: ${error}`);
    }
  }

  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: (event: T) => Promise<Result<void>>
  ): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler as (event: DomainEvent) => Promise<Result<void>>);
    this.handlers.set(eventType, handlers);
  }
} 