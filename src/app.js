import cors from 'cors';
import 'dotenv/config'; // For environment variables
import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json()); // Middleware for parsing JSON
app.use(cors())



mongoose.connect(process.env.DB_LOCATION, { autoIndex:true })
  .then(() => console.log('Connected to MongoDB via Mongoose'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Define a Service schema and model using Mongoose
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
});

const Service = mongoose.model('Service', serviceSchema);
app.get('/',()=>{
  console.log("hi");
  
})
// Add a new service
app.post('/services', async (req, res) => {
  const { name, description, price } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: 'Service name and price are required.' });
  }

  try {
    const newService = new Service({ name, description, price });
    const savedService = await newService.save();
    return res.status(201).json(savedService);
  } catch (error) {
    return res.status(500).json({ message: 'Error adding service', error: error.message });
  }
});

// Get all services
app.get('/services', async (req, res) => {
  try {
    const services = await Service.find();
    return res.status(200).json(services);
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching services', error: error.message });
  }
});

// Update a service
app.put('/services/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format.' });
  }

  if (!name && !description && !price) {
    return res.status(400).json({ error: 'At least one field (name, description, price) must be provided for update.' });
  }

  try {
    const updatedService = await Service.findByIdAndUpdate(
      id,
      { name, description, price },
      { new: true, runValidators: true }
    );

    if (!updatedService) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    return res.status(200).json({ message: 'Service updated successfully.', updatedService });
  } catch (error) {
    return res.status(500).json({ error: 'Error updating service', details: error.message });
  }
});

// Delete a service
app.delete('/services/:id', async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid ID format.' });
  }

  try {
    const deletedService = await Service.findByIdAndDelete(id);

    if (!deletedService) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    return res.status(200).json({ message: 'Service deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Error deleting service', details: error.message });
  }
});

// Listen on a specific port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
