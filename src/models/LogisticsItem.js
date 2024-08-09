class LogisticsItem {
    constructor({
        name = '',
        inbound = 0,
        outbound = 0,
        reserved = 0,
        stock = 0,
        lastMovements = [],
    } = {}) {
        this.name = name;
        this.inbound = inbound;
        this.outbound = outbound;
        this.reserved = reserved;
        this.stock = stock;
        this.lastMovements = lastMovements;
    }

    updateName(newName) {
        this.name = newName;
    }

    addMovement(movement) {
        this.lastMovements.push(movement);
        if (this.lastMovements.length > 10) {
            this.lastMovements.shift();
        }

        switch (movement.state) {
            case 'inbound':
                this.inbound += movement.quantity;
                this.stock += movement.quantity;
                break;
            case 'outbound':
                this.outbound += movement.quantity;
                this.stock = Math.max(0, this.stock - movement.quantity);
                break;
            case 'reserved':
                this.reserved += movement.quantity;
                this.stock = Math.max(0, this.stock - movement.quantity);
                break;
            default:
                throw new Error(`Invalid movement state: ${movement.state}`);
        }
    }

    removeMovement(movementId) {
        const index = this.lastMovements.findIndex(m => m.movementId === movementId);
        if (index !== -1) {
            const movement = this.lastMovements.splice(index, 1)[0];
            switch (movement.state) {
                case 'inbound':
                    this.inbound = Math.max(0, this.inbound - movement.quantity);
                    this.stock = Math.max(0, this.stock - movement.quantity);
                    break;
                case 'outbound':
                    this.outbound = Math.max(0, this.outbound - movement.quantity);
                    this.stock += movement.quantity;
                    break;
                case 'reserved':
                    this.reserved = Math.max(0, this.reserved - movement.quantity);
                    this.stock += movement.quantity;
                    break;
            }
        }
    }



    isEmpty() {
        return this.stock === 0 && this.inbound === 0 && this.outbound === 0 && this.reserved === 0 && this.lastMovements.length === 0;
    }

    toFirestore() {
        return {
            name: this.name,
            inbound: this.inbound,
            outbound: this.outbound,
            reserved: this.reserved,
            stock: this.stock,
            lastMovements: this.lastMovements,

        };
    }

    static fromFirestore(data) {
        return new LogisticsItem(data);
    }
} export default LogisticsItem;