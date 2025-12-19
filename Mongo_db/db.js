const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/autohub')
    .then(() => console.log('Connected to MongoDB via Mongoose'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- SCHEMAS ---

const carSchema = new mongoose.Schema({
    model: String,
    type: String,
    pricePerDay: Number,
    image: String,
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
        features: [String]
    },
    availability: { type: String, default: 'Available' }
});

const customerSchema = new mongoose.Schema({
    name: String,
    joinedDate: String,
    bookingsCount: { type: Number, default: 0 }
});

const bookingSchema = new mongoose.Schema({
    carId: String,
    carName: String,
    customerName: String,
    customerId: String,
    date: String, // Stored as string YYYY-MM-DD
    days: Number,
    status: { type: String, default: 'Active' },
    startDate: String,
    endDate: String,
    totalPrice: Number,
    createdAt: { type: Date, default: Date.now },
    cancelledAt: Date
});

const rentalSchema = new mongoose.Schema({
    bookingId: String,
    carId: String,
    carName: String,
    customerId: String,
    customerName: String,
    startDate: String,
    endDate: String,
    totalPrice: Number,
    status: { type: String, default: 'Active' },
    createdAt: { type: Date, default: Date.now },
    cancelledAt: Date
});

// --- MODELS ---

const Car = mongoose.model('Car', carSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Rental = mongoose.model('Rental', rentalSchema);

// --- HELPER to map _id to id ---
const mapDoc = (doc) => {
    if (!doc) return null;
    const obj = doc.toObject();
    obj.id = obj._id.toString();
    delete obj._id;
    delete obj.__v;
    return obj;
};

// --- API IMPLEMENTATION ---

// Default Data for Seeding
const defaultCars = [
    {
        model: 'Tesla Model S Plaid',
        type: 'Electric Sedan',
        pricePerDay: 15000,
        image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2070&auto=format&fit=crop',
        specs: { range: '396 mi', acceleration: '1.99s 0-60', seating: 5 },
        availability: 'Available'
    },
    {
        model: 'Range Rover Autobiography',
        type: 'Luxury SUV',
        pricePerDay: 25000,
        image: 'https://images.unsplash.com/photo-1606220838315-056192d5e927?q=80&w=1974&auto=format&fit=crop',
        specs: { engine: 'V8 Supercharged', terrain: 'All-Terrain', seating: 7 },
        availability: 'Available'
    },
    {
        model: 'Porsche 911 GT3',
        type: 'Sports Car',
        pricePerDay: 45000,
        image: 'https://images.unsplash.com/photo-1611821064430-0d41765a6109?q=80&w=2070&auto=format&fit=crop',
        specs: { power: '502 hp', topSpeed: '198 mph', transmission: 'PDK' },
        availability: 'Available'
    },
    {
        model: 'Mercedes-AMG G 63',
        type: 'Luxury SUV',
        pricePerDay: 35000,
        image: 'https://images.unsplash.com/photo-1520050206274-2c545c237690?q=80&w=2070&auto=format&fit=crop',
        specs: { power: '577 hp', torque: '627 lb-ft', features: ['Massage Seats', 'Night Package'] },
        availability: 'Available'
    }
];

async function seedCarsIfEmpty() {
    const count = await Car.countDocuments();
    if (count === 0) {
        console.log('Seeding MongoDB with default cars...');
        await Car.insertMany(defaultCars);
        console.log('MongoDB seeded.');
    }
}

async function getCars() {
    await seedCarsIfEmpty();
    const cars = await Car.find();
    return cars.map(mapDoc);
}

async function addCar(carData) {
    const newCar = new Car({
        ...carData,
        image: carData.image || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=2070',
        availability: 'Available'
    });
    await newCar.save();
    return mapDoc(newCar);
}

async function deleteCar(carId) {
    // Check for active bookings
    const activeBooking = await Booking.findOne({ carId: carId, status: 'Active' });
    if (activeBooking) {
        return Promise.reject(new Error('Cannot delete car with active bookings.'));
    }

    const result = await Car.findByIdAndDelete(carId);
    if (!result) return Promise.reject(new Error('Car not found'));
    return { success: true };
}

async function addBooking(bookingData) {
    // --- VALIDATION & PREPARATION ---
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookingDate = new Date(bookingData.date || bookingData.startDate);
    bookingDate.setHours(0, 0, 0, 0);

    if (isNaN(bookingDate.getTime())) {
        return Promise.reject(new Error('Invalid Date format'));
    }

    if (bookingDate <= today) {
        return Promise.reject(new Error('Booking date must be after today.'));
    }

    const threeMonthsFromNow = new Date(today);
    threeMonthsFromNow.setMonth(today.getMonth() + 3);

    const days = Number(bookingData.days || 1);

    if (bookingDate > threeMonthsFromNow) {
        return Promise.reject(new Error('Booking date must be within 3 months from today.'));
    }

    if (days > 100) {
        return Promise.reject(new Error('Booking duration cannot exceed 100 days.'));
    }

    // Derived Fields
    const startDate = bookingDate.toISOString().split('T')[0];
    const endDateObj = new Date(bookingDate);
    endDateObj.setDate(bookingDate.getDate() + days);
    const endDate = endDateObj.toISOString().split('T')[0];

    const car = await Car.findById(bookingData.carId);
    if (!car) return Promise.reject(new Error('Car not found'));

    let totalPrice = bookingData.totalPrice;
    if (!totalPrice) {
        totalPrice = Number(car.pricePerDay) * days;
    }

    // Customer Logic
    let customerId = bookingData.customerId;
    let customerName = bookingData.customerName;

    if (customerId) {
        const customer = await Customer.findById(customerId);
        if (customer) {
            customerName = customer.name;
        } else {
            return Promise.reject(new Error('Invalid Customer ID'));
        }
    } else {
        const newCustomer = new Customer({
            name: customerName,
            joinedDate: new Date().toISOString().split('T')[0],
            bookingsCount: 0
        });
        await newCustomer.save();
        customerId = newCustomer._id.toString();
    }

    const newBooking = new Booking({
        ...bookingData,
        customerId,
        customerName,
        carName: car.model, // Ensure this is saved
        startDate,
        endDate,
        totalPrice,
        status: 'Active'
    });

    await newBooking.save();

    // Update Car
    car.availability = 'Booked';
    await car.save();

    // Update Customer Count
    await Customer.findByIdAndUpdate(customerId, { $inc: { bookingsCount: 1 } });

    // Create Rental
    const rental = new Rental({
        bookingId: newBooking._id.toString(),
        carId: bookingData.carId,
        carName: car.model,
        customerId: customerId,
        customerName: customerName,
        startDate: startDate,
        endDate: endDate,
        totalPrice: totalPrice,
        status: 'Active'
    });
    await rental.save();

    return {
        ...mapDoc(newBooking),
        newCustomerId: bookingData.customerId ? null : customerId,
        rentalId: rental._id.toString(),
        rental: mapDoc(rental)
    };
}

async function cancelBooking(bookingId) {
    const booking = await Booking.findById(bookingId);
    if (!booking) return Promise.reject(new Error('Booking not found'));

    await Booking.findByIdAndDelete(bookingId);

    // Update Car
    await Car.findByIdAndUpdate(booking.carId, { availability: 'Available' });

    // Update Rentals
    const cancelledAt = new Date();
    await Rental.updateMany({ bookingId: bookingId }, { status: 'Cancelled', cancelledAt: cancelledAt });

    // We ideally should keep the booking doc or update it, but current logic deletes it from 'bookings' collection
    // and keeps it in 'rentals'. The prompt implies we want to see it in customer history which pulls from rentals.
    // So updating rentals is key.

    // Note: The previous code deleted the booking. 
    // "await Booking.findByIdAndDelete(bookingId);"
    // If we want to show "cancelled" in a booking list, we shouldn't delete it. 
    // But the current implementation deletes it. 
    // The requirement says "3 of whom have booked multiple cars, have cancelled a few".
    // Usually cancelled bookings are still visible in history. 
    // The "Rentals" collection seems to serve as history.

    // Find the rental to return its ID
    const rental = await Rental.findOne({ bookingId: bookingId });
    return { success: true, rentalId: rental ? rental._id.toString() : 'N/A' };
}

async function getBookings() {
    const bookings = await Booking.find();
    return bookings.map(mapDoc);
}

async function getRentals() {
    const rentals = await Rental.find().sort({ createdAt: -1 });
    return rentals.map(mapDoc);
}

async function addCustomer(customerData) {
    const newCustomer = new Customer({
        ...customerData,
        joinedDate: new Date().toISOString().split('T')[0]
    });
    await newCustomer.save();
    return mapDoc(newCustomer);
}

async function getCustomers() {
    const customers = await Customer.find();
    return customers.map(mapDoc);
}

module.exports = { getCars, addCar, deleteCar, addBooking, cancelBooking, getBookings, getRentals, addCustomer, getCustomers };
