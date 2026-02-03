package com.berksozcu.controller;

import com.berksozcu.entites.collections.ReceivedCollection;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

public interface IReceivedCollectionController {
     ReceivedCollection addCollection(Long id, ReceivedCollection receivedCollection, String schemaName);
     List<ReceivedCollection> getAll();
     ReceivedCollection editReceivedCollection(@PathVariable(name ="id") Long id, @RequestBody ReceivedCollection receivedCollection,
             String schemaName);
     void deleteReceivedCollection(@PathVariable(name = "id") Long id, String schemaName);
     List<ReceivedCollection> getReceivedCollectionByYear(@PathVariable(name = "year") int year);
}
