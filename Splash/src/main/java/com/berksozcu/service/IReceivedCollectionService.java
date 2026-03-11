package com.berksozcu.service;

import com.berksozcu.entites.collections.ReceivedCollection;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IReceivedCollectionService {
     ReceivedCollection addCollection(Long id, ReceivedCollection receivedCollection, String schemaName);
     List<ReceivedCollection> getAll();
     ReceivedCollection editReceivedCollection(Long id, ReceivedCollection receivedCollection, String schemaName);
     void deleteReceivedCollection(Long id, String schemaName);
     Page<ReceivedCollection> getReceivedCollectionsByYear(int page, int size, int year, String schemaName);
}
