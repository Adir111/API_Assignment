// Product class:
export class Product {
    constructor(name, description, category, amount) {
        this.name = name || "N/A";
        this.description = description || "N/A";
        this.category = category || "N/A";
        this.amount = amount || 0;
    }
}