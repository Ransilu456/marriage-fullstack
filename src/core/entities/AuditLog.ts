
export interface AuditLogProps {
    id: string;
    userId: string;
    action: string;
    resource?: string;
    metadata?: string;
    createdAt: Date;
}

export class AuditLog {
    constructor(private props: AuditLogProps) { }

    static create(props: { userId: string; action: string; resource?: string; metadata?: any }): AuditLog {
        return new AuditLog({
            id: crypto.randomUUID(),
            userId: props.userId,
            action: props.action,
            resource: props.resource,
            metadata: props.metadata ? JSON.stringify(props.metadata) : undefined,
            createdAt: new Date()
        });
    }

    get id(): string { return this.props.id; }
    get userId(): string { return this.props.userId; }
    get action(): string { return this.props.action; }
    get resource(): string | undefined { return this.props.resource; }
    get metadata(): string | undefined { return this.props.metadata; }
    get createdAt(): Date { return this.props.createdAt; }

    toJSON() {
        return {
            ...this.props,
            metadata: this.props.metadata ? JSON.parse(this.props.metadata) : undefined
        };
    }
}
