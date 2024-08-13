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
            case 'stock':
                // 'stock' 상태는 reserved 수량만 변경하고 stock은 변경하지 않습니다.
                this.reserved = movement.quantity;
                break;
            default:
                throw new Error(`Invalid movement state: ${movement.state}`);
        }
    }

    removeMovement(movementId) {
        const index = this.lastMovements.findIndex(m => m.movementId === movementId);
        if (index !== -1) {
            const removedMovement = this.lastMovements.splice(index, 1)[0];
            switch (removedMovement.state) {
                case 'inbound':
                    this.inbound = Math.max(0, this.inbound - removedMovement.quantity);
                    this.stock = Math.max(0, this.stock - removedMovement.quantity);
                    break;
                case 'outbound':
                    this.outbound = Math.max(0, this.outbound - removedMovement.quantity);
                    this.stock = Math.min(this.stock + removedMovement.quantity, this.inbound);
                    break;
                case 'stock':
                    this.reserved = Math.max(0, this.reserved - removedMovement.quantity);
                    this.stock = Math.min(this.stock + removedMovement.quantity, this.inbound);
                    break;
            }
        }
    }

    updateMovement(movementId, updatedData) {
        const index = this.lastMovements.findIndex(m => m.movementId === movementId);
        if (index !== -1) {
            const currentMovement = this.lastMovements[index];

            // 기존 movement의 수량을 원상복구
            switch (currentMovement.state) {
                case 'inbound':
                    this.inbound = Math.max(0, this.inbound - currentMovement.quantity);
                    this.stock = Math.max(0, this.stock - currentMovement.quantity);
                    break;
                case 'outbound':
                    this.outbound = Math.max(0, this.outbound - currentMovement.quantity);
                    this.stock += currentMovement.quantity;
                    break;
                case 'stock':
                    this.reserved = Math.max(0, this.reserved - currentMovement.quantity);
                    this.stock += currentMovement.quantity;
                    break;
            }

            // 새로운 데이터를 반영
            this.lastMovements[index] = { ...currentMovement, ...updatedData };

            // 업데이트된 수량을 다시 반영
            switch (updatedData.state) {
                case 'inbound':
                    this.inbound += updatedData.quantity;
                    this.stock += updatedData.quantity;
                    break;
                case 'outbound':
                    this.outbound += updatedData.quantity;
                    this.stock = Math.max(0, this.stock - updatedData.quantity);
                    break;
                case 'stock':
                    this.reserved += updatedData.quantity;
                    this.stock = Math.max(0, this.stock - updatedData.quantity);
                    break;
            }
        }
    }
    updateState() {
        this.inbound = 0;
        this.outbound = 0;
        this.reserved = 0;
        this.stock = 0;

        this.lastMovements.forEach(movement => {
            switch (movement.state) {
                case 'inbound':
                    this.inbound += movement.quantity;
                    this.stock += movement.quantity;
                    break;
                case 'outbound':
                    this.outbound += movement.quantity;
                    this.stock = Math.max(0, this.stock - movement.quantity);
                    break;
                case 'stock':
                    this.reserved += movement.quantity;
                    this.stock = Math.max(0, this.stock - movement.quantity);
                    break;
            }
        });
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