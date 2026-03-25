package com.berksozcu.controller;

import com.berksozcu.entites.collections.ReceivedCollection;
import org.springframework.data.domain.Page;


import java.util.List;

public interface IReceivedCollectionController {
     ReceivedCollection addCollection(Long id, ReceivedCollection receivedCollection, String schemaName);
     ReceivedCollection editReceivedCollection(Long id, ReceivedCollection receivedCollection,
             String schemaName);
     void deleteReceivedCollection(Long id, String schemaName);
     Page<ReceivedCollection> getReceivedCollectionByYear( int page, int size, String search, int year, String schemaName);
}
