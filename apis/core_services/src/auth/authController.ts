import { Request, Response, NextFunction } from "express";
import User from "./userModel";
import { ApiError } from "../core/helper/globalErrorHandler";
import { sendResponse } from "../core/helper/globalResponse";
import { LoginInput } from "./authValidations";

// Login Controller
export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, gasId } = req.body as LoginInput;

        // Check if user with this email exists
        const userByEmail = await User.findOne({ email });

        // Check if user with this gasId exists
        const userByGasId = await User.findOne({ gasId });

        // Scenario 1: Both email and gasId found
        if (userByEmail && userByGasId) {
            // Check if they belong to the same user
            if (userByEmail._id.toString() === userByGasId._id.toString()) {
                // Update lastLoggedIn
                userByEmail.lastLoggedIn = new Date();
                await userByEmail.save();

                // Success: Both credentials match the same user
                return sendResponse({
                    res,
                    status: 200,
                    message: "Login successful",
                    data: {
                        user: {
                            _id: userByEmail._id,
                            email: userByEmail.email,
                            gasId: userByEmail.gasId,
                            lastLoggedIn: userByEmail.lastLoggedIn,
                            createdAt: userByEmail.createdAt,
                            updatedAt: userByEmail.updatedAt
                        }
                    }
                });
            } else {
                // Error: Email and gasId belong to different users
                throw new ApiError(
                    400,
                    "Email and GasId belong to different users. Please check your credentials."
                );
            }
        }

        // Scenario 2: Only email found (gasId doesn't match)
        if (userByEmail && !userByGasId) {
            throw new ApiError(
                400,
                "Email exists but GasId does not match. Please check your GasId."
            );
        }

        // Scenario 3: Only gasId found (email doesn't match)
        if (!userByEmail && userByGasId) {
            throw new ApiError(
                400,
                "GasId exists but email does not match. Please check your email."
            );
        }

        // Scenario 4: Neither email nor gasId found - Create new user
        const newUser = await User.create({
            email,
            gasId,
            lastLoggedIn: new Date()
        });

        sendResponse({
            res,
            status: 201,
            message: "User created and logged in successfully",
            data: {
                user: {
                    _id: newUser._id,
                    email: newUser.email,
                    gasId: newUser.gasId,
                    lastLoggedIn: newUser.lastLoggedIn,
                    createdAt: newUser.createdAt,
                    updatedAt: newUser.updatedAt
                }
            }
        });
    } catch (err) {
        next(err);
    }
};
