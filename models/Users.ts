import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

// Define the shape of a User object in TypeScript
export interface IUser {
    email: string;
    password: string;
    _id?: mongoose.Types.ObjectId; 
    createdAt?: Date;             
    updatedAt?: Date;             
}

// Define the schema (structure) for a User document in MongoDB
const userSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },  // Email is required and must be unique
    password: { type: String, required: true },             // Password is required
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Hash password before saving to the database
// "save" means this code runs just before a document is saved to the MongoDB database.
// could be used like this await newUser.save();
userSchema.pre("save", async function (next) {
    // 'this' refers to the user document being saved

    // Only hash the password if it has been modified (e.g., during signup or password change)
    if (this.isModified("password")) {
        // Hash the password with a salt round of 10 and replace the plain password with the hashed one
        this.password = await bcrypt.hash(this.password, 10);
    }

    // Proceed to the next step (saving the document)
    next();
});

// Use existing "User" model if already defined (prevents model overwrite error in dev),
// otherwise create a new one using the schema
const User = models?.User || model<IUser>("User", userSchema);

// Export the User model so it can be used in other parts of the app
export default User;
