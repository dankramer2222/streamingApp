import { db } from "./db";
import { getSelf } from "./auth-service";

export const isFollowingUser = async(id:string) =>{
    try{
        const self = await getSelf();

        const otherUser = await db.user.findUnique({
            where:{id},
        });
        if (!otherUser){
            throw new Error("User not found");
        }

        if (otherUser.id === self.id){
            return true;
        }

        const existingFollow = await db.follow.findFirst({
            where:{
                followerId:self.id,
                followingId:otherUser.id,
            },
        });
        return !!existingFollow;
    }catch{
        return false;
    }
};

export const followUser = async(id:string) =>{
    const self = await getSelf();

    const otherUser = await db.user.findUnique({
        where:{id}
    });

    if (!otherUser){
        throw new Error("user not found")
    }

    if (otherUser.id === self.id){
        throw new Error("Cannot follow yourself =_= ");
    }

    const existingFollow = await db.follow.findFirst({
        where:{
            followerId:self.id,
            followingId:otherUser.id,
        },
    });

    if (existingFollow){
        throw new Error("already following");
    }

    const follow = await db.follow.create({
        data:{
            followerId:self.id,
            followingId:otherUser.id,
        },
        include:{
            following:true,
            follower:true,
        },
    });
    return follow;
};  

export const unfollowUser = async(id: string) =>{
    const self = await getSelf()

    const otherUser = await db.user.findUnique({
        where:{
            id,
        },
    });
    if (!otherUser){
        throw new Error("User not Found");
    }

    if(otherUser.id === self.id){
        throw new Error("Cannot unfollow yourself");
    }

    const existingFollow = await db.follow.findFirst({
        where:{
            followerId:self.id,
            followingId: otherUser.id,
        },
    });

    if (!existingFollow){
        throw new Error("Not following");
    }

    const follow = await db.follow.delete({
        where:{
            id:existingFollow.id,
        },
        include:{
            following:true,
        },
    });
    return follow;
};