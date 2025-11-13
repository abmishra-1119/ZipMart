import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true,
        minLength: [3, 'Name will be greater than 3'],
        maxLength: [30, 'Enter a valid length'],
        // validate: {
        //     validator: function (value) {
        //         return /^[a-zA-Z]+$/.test(value)
        //     },
        //     message: 'Name must be Alphabetic'
        // }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true,
        validate: {
            validator: function(value) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(value)
            },
            message: 'Enter a valid Email'
        }
    },
    phone: {
        type: String,
        // required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        validate: {
            validator: function(value) {
                return /^[0-9]/.test(value)
            },
            message: 'Enter a valid age'
        },
        min: [18, "age must be greater than 18 "],
        max: [99, "Enter a valid age"]
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'seller'],
        default: 'user',
        index: true
    },
    cart: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            index: true,
            validate: {
                validator: async function(v) {
                    const product = await mongoose.model('Product').findById(v);
                    return !!product;
                },
                message: "Please Enter a valid Product ID"
            },
        },
        count: Number,
        _id: false
    }],
    avatar: {
        url: String,
        public_id: String
    },
    refreshTokens: [{
        token: {
            type: String,
            index: true
        },
        userAgent: String,
        createdAt: { type: String, default: Date.now },
        _id: false
    }],
    addresses: [{
        fullName: String,
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
        phone: String,
        isDefault: { type: Boolean, default: false },
        _id: false
    }],

}, { timestamps: true })

UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});


UserSchema.index({ email: 1, name: -1 });
UserSchema.index({ role: 1, email: 1 });
UserSchema.index({ role: 1, name: 1 });
UserSchema.index({ role: 1, createdAt: -1 });
UserSchema.index({ 'refreshTokens.createdAt': 1 });

export default mongoose.model('User', UserSchema)