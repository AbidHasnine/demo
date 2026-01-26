package com.codecollab.source.repository;

import com.codecollab.source.entity.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
//Abid's part
@Repository
public interface RoomRepository extends MongoRepository<Room, String> {
    Optional<Room> findByRoomId(String roomId);
    boolean existsByRoomId(String roomId);
    List<Room> findByCreatorId(String creatorId);//Experimental
    List<Room> findByIsActiveTrue();//Experimental
}
