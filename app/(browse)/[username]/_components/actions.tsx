"use client";

import { Button } from "@/components/ui/button";
import { onFollow ,onUnFollow} from "@/actions/follow";
import { useTransition } from "react";
import { toast } from "sonner";

interface ActionsProps{
    isFollowing:boolean;
    userId:string;
  };

export const Actions = ({
    isFollowing,
    userId,
}: ActionsProps) =>{
    const [isPending,startTransition] = useTransition();

    const handleFollow = () =>{
        startTransition(()=>{
            onFollow(userId)
            .then((data) => toast.success(`You are following now ${data.following.username}`))
            .catch(()=> toast.error("somethnig went wrong"));
        });
    }

    const handleUnFollow = () =>{
        startTransition(()=>{
            onUnFollow(userId)
            .then((data) => toast.success(`You have successfully unfollowed! ${data.following.username}`))
            .catch(()=> toast.error("somethnig went wrong"));
        });
    }

    const onClick = () =>{
        if (isFollowing){
            handleUnFollow()
        }else {
            handleFollow()
        }
    }

    return(
        <Button 
        disabled={isPending} 
        onClick={onClick} 
        variant="primary"
        
        >
            {isFollowing ? "Unfollow":"Follow"}
        </Button>
    );
};