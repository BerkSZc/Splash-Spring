package com.berksozcu.service;

import com.berksozcu.dto.collection.CollectionDto;
import com.berksozcu.entites.collections.CollectionType;
import org.springframework.data.domain.Page;

public interface ICollectionService {
     CollectionDto addCollection(Long id, CollectionDto collectionDto, String schemaName);
     CollectionDto editCollection(Long id, CollectionDto collectionDto, String schemaName);
     void deleteCollection(Long id, String schemaName, CollectionType type);
     Page<CollectionDto> getCollectionsByYear(int page,
                                                     int size,
                                                     String search,
                                                     int year,
                                                     String schemaName,
                                                     CollectionType collectionType);
}
