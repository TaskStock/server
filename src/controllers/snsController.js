const snsModel = require('../models/snsModel.js');
const db = require('../config/db.js');
const {bucket} = require('../config/multerConfig.js');
const badgeModel = require('../models/badgeModel.js');
const sharp = require('sharp')

module.exports = {
    changePrivate: async(req, res, next) => {
        const cn = await db.connect();
        try {
            cn.query('BEGIN');

            const user_id = req.user.user_id;
            const private = req.body.private;
            const changeResult = await snsModel.changePrivate(cn, user_id, private);
            if (changeResult) {
                await cn.query('COMMIT');
                return res.status(200).json({
                    result: "success"
                });
            } else {
                await cn.query('ROLLBACK');
                return res.status(400).json({
                    result: "fail"
                });
            }
        } catch (err) {
            await cn.query('ROLLBACK');
            next(err);
            
        } finally {
            cn.release();
        }
    },

    followUser: async(req, res, next) => {
        const cn = await db.connect();
        try {
            await cn.query('BEGIN');
            const follower_id = req.user.user_id;
            const following_id = req.body.following_id;
            const notice_id = req.body.notice_id
            
            const followResult = await snsModel.followUser(cn, follower_id, following_id, notice_id);

            if (followResult) {
                await cn.query('COMMIT');
                return res.status(200).json({
                    result: "success",
                });
            } else {
                await cn.query('ROLLBACK');
                res.status(400).json({
                    result: "fail"
                });
            }
        } catch (err) {
            next(err);
            await cn.query('ROLLBACK');
            
        } finally {
            cn.release();
        }
    },
    unfollowUser: async(req, res, next) => {
        const cn = await db.connect();
        try {
            await cn.query('BEGIN');
            const follower_id = req.user.user_id;
            const unfollowing_id = req.body.unfollowing_id;
            const unfollowResult = await snsModel.unfollowUser(cn, follower_id, unfollowing_id);

            if (unfollowResult) {
                await cn.query('COMMIT');
                return res.status(200).json({
                    result: "success"
                });
            } else {
                await cn.query('ROLLBACK');
                return res.status(400).json({
                    result: "fail"
                });
            }
        } catch (err) {
            await cn.query('ROLLBACK');
            next(err);
            
        } finally {
            cn.release();
        }
    },
    searchUser: async(req, res, next) => {
        try {
        const searchTarget = req.query.searchTarget; //이메일 또는 닉네임
        const searchScope = req.query.searchScope; //검색 범위
        const user_id = req.user.user_id;
        const searchResult = await snsModel.searchUser(db, searchTarget, searchScope, user_id);
        return res.status(200).json({
            result: "success",
            searchResult: searchResult
        })
    } catch (err) {
        next(err);  
    }},
    showFollowList: async(req, res, next) => {
        const cn = await db.connect();
        try {
            await cn.query('BEGIN');
            const user_id = req.user.user_id;

            const [followerList, followingList] = await snsModel.showFollowList(cn, user_id);
            await cn.query('COMMIT');
            return res.status(200).json({
                result: "success",
                followerList: followerList,
                followingList: followingList
            });
        } catch (err) {
            await cn.query('ROLLBACK');
            next(err);
            
        } finally {
            cn.release();
        }
    },
    editUserInfo: async(req, res, next) => {
        try {
            const user_id = req.user.user_id;
            const user_name = req.body.user_name;
            const introduce = req.body.introduce;

            const editResult = await snsModel.editUserInfo(db, user_id, user_name, introduce);
            if (editResult) {
                return res.status(200).json({
                    result: "success"
                });
            } else {
                return res.status(400).json({
                    result: "fail"
                });
            }
        } catch (err) {
            next(err);
        }
    },
    editUserImage: async(req, res, next) => {
        try {
            const user_id = req.user.user_id;
            const image_file = req.file;
            
            // 이미지 없는 경우
            if (!image_file) {
                return res.status(400).json({
                    message: "이미지 파일이 없습니다.",
                    result: "fail"
                });
            }

            // 이미지 파일 압축
            const buffer = image_file.buffer;
            const metadata = await sharp(buffer).metadata();
            let compressedBuffer;
            
            if (metadata.width > 320) {
                compressedBuffer = await sharp(buffer)
                    .resize({ width: 320 })
                    .jpeg({ quality: 70 })
                    .toBuffer();
            } else {
                compressedBuffer = await sharp(buffer)
                    .jpeg({ quality: 70 })
                    .toBuffer();
            }
        
            const uniqueFileName = `${Date.now()}-${user_id}`;
            const blob = bucket.file(uniqueFileName);
            const blobStream = blob.createWriteStream({
                resumable: false,
                metadata: {
                    contentType: image_file.mimetype
                }
            });
            //오류 발생 시 처리
            blobStream.on('error', err => {
                next(err);
            });
            //파일 업로드 완료 시
            blobStream.on('finish', async () => {
                // 파일 업로드 후 공개적으로 접근 가능하도록 설정
                await blob.makePublic();
                
            // update전 기존 이미지 삭제
                const beforeUrl = await snsModel.checkUserImage(db, user_id);

                // 'taskstock-bucket-1'이 문자열에 포함되어 있는지 확인
                const intTheBucket = beforeUrl.includes("taskstock-bucket-1");
                if (beforeUrl && intTheBucket) {

                    const lastSlashIndex = beforeUrl.lastIndexOf('/') + 1; // 마지막 슬래시 위치 다음 인덱스
                    const beforeFilename = beforeUrl.substring(lastSlashIndex); // 마지막 슬래시 이후 문자열 추출
                    const beforeBlob = bucket.file(beforeFilename);
                    try {
                        await beforeBlob.delete();
                    } catch (err) {
                        next(err);
                    }
                }
                //게시 및 프로필 이미지 경로를 DB에 저장
                const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

                await snsModel.editUserImage(db, user_id, publicUrl);

                return res.status(200).json({
                    result: "success",
                    imagePath : publicUrl
                });
            });
            
        // GCS에 파일 업로드
        blobStream.end(compressedBuffer);


        } catch (err) {
            next(err);
        }
    },
    acceptPending: async(req, res, next) => {
        const cn = await db.connect();
        try {
            await cn.query('BEGIN');

            const following_id = req.user.user_id;
            const follower_id = req.body.follower_id;
            const notice_id = req.body.notice_id
            const acceptResult = await snsModel.acceptPending(cn, follower_id, following_id, notice_id);
            
            if (acceptResult) {
                await cn.query('COMMIT');
                res.status(200).json({
                    result: "success"
                });
            } else {
                await cn.query('ROLLBACK');
                res.status(400).json({
                    result: "fail"
                });
            }
        } catch (err) {
            next(err);
            await cn.query('ROLLBACK');
            
        } finally {
            cn.release();
        }
    },
    changeDefaultImage: async(req, res, next) => {
        const user_id = req.user.user_id;
        const changeResult = await snsModel.changeDefaultImage(db, user_id);
        
        if (changeResult) {
            return res.status(200).json({
                result: "success",
            });
        } else {
            next(err);
        }
    },
    cancelFollow: async(req, res, next) => {
        const cn = await db.connect();
        try {
            await cn.query('BEGIN');

            const follower_id = req.user.user_id;
            const following_id = req.body.following_id;
            const notice_id = req.body.notice_id;
            const cancelResult = await snsModel.cancelFollow(cn, follower_id, following_id, notice_id);
            
            if (cancelResult == true) {
                await db.query('COMMIT');
                return res.status(200).json({
                    result: "success"
                });
            } else if (cancelResult == false) {
                await db.query('ROLLBACK');    
                return res.status(500).json({
                    result: "fail"
                });
            } else if (cancelResult == 'alreadyAccepted') {
                await db.query('ROLLBACK');
                return res.status(400).json({
                    result: "alreadyAccepted"
                });
            } 
        } catch (err) {
            await db.query('ROLLBACK');
            next(err);
        } finally {
            cn.release();
        }
    },
    userDetail: async(req, res, next) => {
        const cn = await db.connect();
        try {
        await cn.query('BEGIN');

        const my_id = req.user.user_id;
        const target_id = req.params.user_id;

        const [targetData, values, todos, projects] = await snsModel.userDetail(cn, my_id, target_id)
        const badges = await badgeModel.getBadges(cn, target_id);

        await cn.query('COMMIT');
        return res.status(200).json({
            result: "success",
            targetData: targetData,
            values: values,
            todos: todos,
            projects: projects,
            badges: badges
        })
        } catch (err) {
            await cn.query('ROLLBACK');
            next(err);
        } finally {
            cn.release();
        }
    }
}
