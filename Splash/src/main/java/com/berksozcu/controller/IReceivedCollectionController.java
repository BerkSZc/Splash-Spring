package com.berksozcu.controller;

import com.berksozcu.dto.collection.CollectionDto;
import com.berksozcu.entites.collections.ReceivedCollection;
import org.springframework.data.domain.Page;


import java.util.List;

public interface IReceivedCollectionController {
     CollectionDto addCollection(Long id, CollectionDto receivedCollection, String schemaName);
     CollectionDto editReceivedCollection(Long id, CollectionDto receivedCollection,
             String schemaName);
     void deleteReceivedCollection(Long id, String schemaName);
     Page<CollectionDto> getReceivedCollectionByYear( int page, int size, String search, int year, String schemaName);
}
