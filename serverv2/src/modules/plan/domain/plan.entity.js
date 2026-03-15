export class Plan {
  constructor({
    id,
    name,
    type, // personal | business
    price,
    speedRate,
    durationDays,
    devicesAllowed,
    features,
    mikrotikProfile,
    status = "active"
  }) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.price = price;
    this.speedRate = speedRate;
    this.durationDays = durationDays;
    this.devicesAllowed = devicesAllowed;
    this.features = features;
    this.mikrotikProfile = mikrotikProfile;
    this.status = status;
  }
}