package com.zoop.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.zoop.backend.domain.entity.Bookmark;
import com.zoop.backend.domain.entity.Candidate;
import com.zoop.backend.domain.entity.Post;
import com.zoop.backend.repository.BookmarkRepository;
import com.zoop.backend.repository.CandidateRepository;
import com.zoop.backend.repository.PostRepository;

// DTO 클래스 추가 (파일 상단 또는 별도 파일로 분리 가능)
class BookmarkDto {
    private Long bookmarkId;
    private Long postId;
    private String postTitle;
    private String postDescription;
    private String postLocation;
    private String postSalaryStart;
    private String postSalaryEnd;
    private String postStatus;
    private java.time.LocalDate postPostedDate;
    private java.time.LocalDateTime createdAt;
    private String companyName;
    private String postProgrammingLanguage;
    private java.time.LocalDate postExpiryDate;
    private Integer postHeadcount;

    public BookmarkDto(Bookmark bookmark) {
        this.bookmarkId = bookmark.getBookmarkId();
        this.postId = bookmark.getPost().getPostId();
        this.postTitle = bookmark.getPost().getPostTitle();
        this.postDescription = bookmark.getPost().getPostDescription();
        this.postLocation = bookmark.getPost().getPostLocation();
        this.postSalaryStart = bookmark.getPost().getPostSalaryStart();
        this.postSalaryEnd = bookmark.getPost().getPostSalaryEnd();
        this.postStatus = bookmark.getPost().getPostStatus();
        this.postPostedDate = bookmark.getPost().getPostPostedDate();
        this.createdAt = bookmark.getCreatedAt();
        this.companyName = bookmark.getPost().getCompany() != null ? bookmark.getPost().getCompany().getCompanyName() : "ZOOP";
        this.postProgrammingLanguage = bookmark.getPost().getPostProgrammingLanguage();
        this.postExpiryDate = bookmark.getPost().getPostExpiryDate();
        this.postHeadcount = bookmark.getPost().getPostHeadcount();
    }

    // Getters (setter 생략, 필요시 추가)
    public Long getBookmarkId() { return bookmarkId; }
    public Long getPostId() { return postId; }
    public String getPostTitle() { return postTitle; }
    public String getPostDescription() { return postDescription; }
    public String getPostLocation() { return postLocation; }
    public String getPostSalaryStart() { return postSalaryStart; }
    public String getPostSalaryEnd() { return postSalaryEnd; }
    public String getPostStatus() { return postStatus; }
    public java.time.LocalDate getPostPostedDate() { return postPostedDate; }
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public String getCompanyName() { return companyName; }
    public String getPostProgrammingLanguage() { return postProgrammingLanguage; }
    public java.time.LocalDate getPostExpiryDate() { return postExpiryDate; }
    public Integer getPostHeadcount() { return postHeadcount; }
}

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {
    private final BookmarkRepository bookmarkRepo;
    private final CandidateRepository candidateRepo;
    private final PostRepository postRepo;

    public BookmarkController(BookmarkRepository bookmarkRepo, CandidateRepository candidateRepo, PostRepository postRepo) {
        this.bookmarkRepo = bookmarkRepo;
        this.candidateRepo = candidateRepo;
        this.postRepo = postRepo;
    }

    // 북마크 추가
    @PostMapping
    public Bookmark addBookmark(@RequestParam Long candidateId, @RequestParam Long postId) {
        Candidate candidate = candidateRepo.findById(candidateId).orElseThrow();
        Post post = postRepo.findById(postId).orElseThrow();
        Bookmark bookmark = new Bookmark();
        bookmark.setCandidate(candidate);
        bookmark.setPost(post);
        return bookmarkRepo.save(bookmark);
    }

    // 북마크 해제
    @DeleteMapping
    public void removeBookmark(@RequestParam Long candidateId, @RequestParam Long postId) {
        bookmarkRepo.findByCandidate_CandidateIdAndPost_PostId(candidateId, postId)
            .ifPresent(bookmarkRepo::delete);
    }

    // 내 북마크 목록 조회 (DTO로 반환)
    @GetMapping
    public List<BookmarkDto> getBookmarks(@RequestParam Long candidateId) {
        return bookmarkRepo.findByCandidate_CandidateId(candidateId)
            .stream()
            .map(BookmarkDto::new)
            .toList();
    }

    // 내 북마크 목록 조회 (PathVariable 사용)
    @GetMapping("/candidate/{candidateId}")
    public List<BookmarkDto> getBookmarksByCandidateId(@PathVariable Long candidateId) {
        return bookmarkRepo.findByCandidate_CandidateId(candidateId)
            .stream()
            .map(BookmarkDto::new)
            .toList();
    }
} 