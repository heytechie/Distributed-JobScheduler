import type {ErrorRequestHandler,Request} from "express";
import {ZodError} from "zod";
import {Prisma} from "@prisma/client";
import {AppError} from "../utils/errors/app-error.js";
import {logger} from "../config/logger.js";

export const errorHandler:ErrorRequestHandler = (error,req,res,_next)=>{
    if(error instanceof ZodError){
        logger.warn({
            method:req.method,
            path:req.path,
            errors:error.issues
        },"Request validation failed");

        res.status(400).json({
            success:false,
            error:{
                code:"VALIDATION_ERROR",
                message:"Request validation failed",
                details:error.issues
            }
        });

        return;
    }

    if(error instanceof Prisma.PrismaClientKnownRequestError){
        logger.error({
            err:error,
            method:req.method,
            prismaCode:error.code,
            path:req.path
        },"Database error occurred");
        
        if(error.code === "P2002"){
            res.status(409).json({
                success:false,
                error:{
                    code:"RESOURCE_CONFLICT",
                    message:"Resource already exists",
                }
            });
            return
        }

        res.status(500).json({
            success:false,
            error:{
                code:"DATABASE_ERROR",
                message:"Database operation failed",
                details:error.message
            }
        })
        return;
    }


    if(error instanceof AppError){
        const log = error.statusCode>=500
        ?logger.error.bind(logger)
        :logger.warn.bind(logger);

        log({
            err:error,
            code:error.code,
            method:req.method,
            path:req.originalUrl,
            details:error.details
        },error.message);

        res.status(error.statusCode).json({
            success:false,
            error:{
                code:error.code,
                message:error.message,
                details:error.details
            }
        });
        return;
    }

    logger.error({
        err:error,
        method:req.method,
        path:req.originalUrl
    },"Unexpected error occurred");

    res.status(500).json({
        success:false,
        error:{
            code:"INTERNAL_SERVER_ERROR",
            message:"An unexpected error occurred"
        }
    });
}