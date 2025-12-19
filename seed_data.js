const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/autohub')
    .then(() => console.log('Connected to MongoDB via Mongoose'))
    .catch(err => console.error('MongoDB connection error:', err));

// Schemas (copied from Mongo_db/db.js to ensure standalone execution)
const carSchema = new mongoose.Schema({
    model: String,
    type: String, // Sedan, SUV, etc.
    pricePerDay: Number,
    image: String, // URL
    specs: {
        range: String,
        acceleration: String,
        seating: Number,
        engine: String,
        terrain: String,
        power: String,
        topSpeed: String,
        transmission: String,
        torque: String,
        features: [String] // e.g. Autopilot, GPS
    },
    availability: { type: String, default: 'Available' } // Available, Booked, Maintenance
});

const customerSchema = new mongoose.Schema({
    name: String,
    license: String,
    joinedDate: String, // YYYY-MM-DD
    totalRentals: { type: Number, default: 0 }
});

const rentalSchema = new mongoose.Schema({
    carName: String, // Snapshot
    carId: String,
    customerName: String,
    customerId: String,
    startDate: String,
    endDate: String,
    totalPrice: Number,
    status: { type: String, default: 'Active' },
    createdAt: { type: Date, default: Date.now },
    cancelledAt: Date
});

const bookingSchema = new mongoose.Schema({
    carName: String,
    carId: String,
    customerName: String,
    customerId: String,
    date: String,
    days: Number,
    totalPrice: Number,
    createdAt: { type: Date, default: Date.now },
    cancelledAt: Date
});

const Car = mongoose.model('Car', carSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Rental = mongoose.model('Rental', rentalSchema);
const Booking = mongoose.model('Booking', bookingSchema);

const carsData = [
    { model: "Tesla Model S Plaid", type: "Electric", price: 15000, img: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000", specs: { features: ["Autopilot", "1020 hp"] } },
    { model: "Porsche 911 GT3", type: "Sports Car", price: 25000, img: "https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&q=80&w=1000", specs: { features: ["502 hp", "PDK"] } },
    { model: "Mercedes AMG G63", type: "SUV", price: 22000, img: "https://images.unsplash.com/photo-1520031441872-265149a716d9?auto=format&fit=crop&q=80&w=1000", specs: { features: ["V8 Biturbo", "Off-road"] } },
    { model: "BMW M4 Competition", type: "Sports Car", price: 18000, img: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&q=80&w=1000", specs: { features: ["503 hp", "Drift Mode"] } },
    { model: "Audi RS e-tron GT", type: "Electric", price: 16000, img: "https://images.unsplash.com/photo-1614200187524-dc4b89348458?auto=format&fit=crop&q=80&w=1000", specs: { features: ["Silent", "Fast"] } },
    { model: "Lamborghini Huracan", type: "Supercar", price: 45000, img: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&q=80&w=1000", specs: { features: ["V10", "Loud"] } },
    { model: "Range Rover Autobiography", type: "SUV", price: 19000, img: "https://images.unsplash.com/photo-1606220838315-9969623c727c?auto=format&fit=crop&q=80&w=1000", specs: { features: ["Luxury", "Massage Seats"] } },
    { model: "Ferrari F8 Tributo", type: "Supercar", price: 50000, img: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?auto=format&fit=crop&q=80&w=1000", specs: { features: ["V8 Turbo", "Red"] } },
    { model: "Ford Mustang Mach 1", type: "Muscle", price: 12000, img: "https://images.unsplash.com/photo-1584345604166-778ce978fb2c?auto=format&fit=crop&q=80&w=1000", specs: { features: ["V8", "Manual"] } },
    { model: "Chevrolet Corvette C8", type: "Sports Car", price: 14000, img: "https://images.unsplash.com/photo-1612056692998-db6247c40c88?auto=format&fit=crop&q=80&w=1000", specs: { features: ["Mid-Engine", "Targa"] } },
    { model: "Toyota Land Cruiser", type: "SUV", price: 15000, img: "https://images.unsplash.com/photo-1594233466428-8541e258671c?auto=format&fit=crop&q=80&w=1000", specs: { features: ["Reliable", "4x4"] } },
    { model: "Rolls Royce Ghost", type: "Luxury", price: 60000, img: "https://images.unsplash.com/photo-1631295868223-6326585125fe?auto=format&fit=crop&q=80&w=1000", specs: { features: ["Starlight Headliner"] } },
    { model: "Bentley Continental GT", type: "Luxury", price: 40000, img: "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1000", specs: { features: ["W12", "Grand Tourer"] } },
    { model: "McLaren 720S", type: "Supercar", price: 48000, img: "https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&q=80&w=1000", specs: { features: ["Dihedral Doors"] } },
    { model: "Jeep Wrangler Rubicon", type: "SUV", price: 10000, img: "https://images.unsplash.com/photo-1563941402230-146399125669?auto=format&fit=crop&q=80&w=1000", specs: { features: ["Off-road", "Convertible"] } },
    { model: "Mini Cooper S", type: "Hatchback", price: 8000, img: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&q=80&w=1000", specs: { features: ["Go-kart feel"] } },
    { model: "Lexus LC 500", type: "Sports Car", price: 17000, img: "https://images.unsplash.com/photo-1595111162386-d2433d7d7670?auto=format&fit=crop&q=80&w=1000", specs: { features: ["V8 Natural", "Concept Looks"] } },
    { model: "Jaguar F-Type", type: "Sports Car", price: 16000, img: "https://images.unsplash.com/photo-1567812971279-d5804362725e?auto=format&fit=crop&q=80&w=1000", specs: { features: ["Exhaust Note"] } },
    { model: "Volvo XC90", type: "SUV", price: 11000, img: "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?auto=format&fit=crop&q=80&w=1000", specs: { features: ["Safe", "Hybrid"] } },
    { model: "Volkswagen Golf R", type: "Hatchback", price: 9000, img: "https://images.unsplash.com/photo-1590059530490-67c29fb665d0?auto=format&fit=crop&q=80&w=1000", specs: { features: ["AWD", "Turbo"] } }
];

const customersData = [
    { name: "Arjun Kapoor", historyType: "Complex", bookingsCount: 3 },
    { name: "Sarah Khan", historyType: "Complex", bookingsCount: 4 },
    { name: "Rahul Verma", historyType: "Complex", bookingsCount: 3 },
    { name: "Priya Sharma", historyType: "Simple", bookingsCount: 1 },
    { name: "Vikram Singh", historyType: "Simple", bookingsCount: 1 }
];

function getDate(offsetDays) {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
}

async function seed() {
    await Car.deleteMany({});
    await Customer.deleteMany({});
    await Rental.deleteMany({});
    await Booking.deleteMany({});

    console.log("Cleared DB.");

    // Insert Cars
    const createdCars = await Car.insertMany(carsData.map(c => ({
        model: c.model,
        type: c.type,
        pricePerDay: c.price,
        image: c.img,
        specs: c.specs,
        availability: 'Available'
    })));
    console.log("Cars seeded.");

    const createdCustomers = [];
    for (let c of customersData) {
        const cust = await Customer.create({
            name: c.name,
            license: "DL-" + Math.floor(Math.random() * 100000),
            joinedDate: getDate(-100)
        });
        createdCustomers.push({ ...cust.toObject(), historyType: c.historyType });
    }
    console.log("Customers seeded.");

    // Create Rentals/Bookings for customers
    // 3 Complex: Active, Cancelled, Completed
    // 2 Simple: 1 Active or 1 Completed

    for (let cust of createdCustomers) {
        if (cust.historyType === "Complex") {
            // 1. Completed Rental (Past)
            const car1 = createdCars[Math.floor(Math.random() * createdCars.length)];
            await Rental.create({
                carName: car1.model,
                carId: car1._id,
                customerName: cust.name,
                customerId: cust._id,
                startDate: getDate(-60),
                endDate: getDate(-55), // 5 days
                totalPrice: car1.pricePerDay * 5,
                status: 'Completed'
            });

            // 2. Active Rental (Current) - Mark car as Booked
            const car2 = createdCars[Math.floor(Math.random() * createdCars.length)];
            await Rental.create({
                carName: car2.model,
                carId: car2._id,
                customerName: cust.name,
                customerId: cust._id,
                startDate: getDate(-2),
                endDate: getDate(3), // 5 days total, 2 passed
                totalPrice: car2.pricePerDay * 5,
                status: 'Active'
            });
            await Car.findByIdAndUpdate(car2._id, { availability: 'Booked' });
            // Also create a booking entry for active one? 
            // Logic in app adds to Bookings and Rentals properly. 
            // We can just add to Bookings for the View as well.
            await Booking.create({
                carName: car2.model,
                carId: car2._id,
                customerName: cust.name,
                customerId: cust._id,
                date: getDate(-2),
                days: 5,
                totalPrice: car2.pricePerDay * 5
            });

            // 3. Cancelled Rental
            const car3 = createdCars[Math.floor(Math.random() * createdCars.length)];
            const start = getDate(-20);
            const end = getDate(-15);
            // Cancelled 2 days after start
            const cancelledAt = new Date();
            cancelledAt.setDate(cancelledAt.getDate() - 18); // Cancelled long ago

            await Rental.create({
                carName: car3.model,
                carId: car3._id,
                customerName: cust.name,
                customerId: cust._id,
                startDate: start,
                endDate: end,
                totalPrice: car3.pricePerDay * 5,
                status: 'Cancelled',
                cancelledAt: cancelledAt
            });
        } else {
            // Simple: Just 1 Active Booking
            const car = createdCars[Math.floor(Math.random() * createdCars.length)];
            // Avoid picking already booked car if possible, but for sim it's ok
            await Rental.create({
                carName: car.model,
                carId: car._id,
                customerName: cust.name,
                customerId: cust._id,
                startDate: getDate(1), // Future booking
                endDate: getDate(3),
                totalPrice: car.pricePerDay * 2,
                status: 'Active'
            });
            await Car.findByIdAndUpdate(car._id, { availability: 'Booked' });
            await Booking.create({
                carName: car.model,
                carId: car._id,
                customerName: cust.name,
                customerId: cust._id,
                date: getDate(1),
                days: 2,
                totalPrice: car.pricePerDay * 2
            });
        }
    }
    console.log("History seeded.");
    mongoose.connection.close();
}

seed();
