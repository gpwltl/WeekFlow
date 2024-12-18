import { Result } from "@/shared/core/Result";
import { DomainEvent } from "../../domain/events/DomainEvent";

export interface IEventPublisher {
  publish(event: DomainEvent): Promise<Result<void>>;
} 