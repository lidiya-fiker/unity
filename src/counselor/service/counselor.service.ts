import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Counselor } from "../entities/counselor.entity";
import { Repository } from "typeorm";
import { User } from "src/auth/entity/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CompleteCounselorProfileDto } from "../dto/complete-counselor-profile.dto";

@Injectable()
export class CounselorService {
  constructor(
    @InjectRepository(Counselor)
    private readonly counselorRepository: Repository<Counselor>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async completeProfile(dto: CompleteCounselorProfileDto): Promise<Counselor> {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== 'COUNSELOR') {
      throw new ForbiddenException(
        'Only counselors can complete a counselors profile',
      );
    }

    let counselor = await this.counselorRepository.findOne({
      where: { userId: dto.userId },
      relations: ['user'],
    });

    if (!counselor) {
      counselor = this.counselorRepository.create({
        ...user,
        ...dto,
      });
    } else {
      this.counselorRepository.merge(counselor, dto);
    }

    return await this.counselorRepository.save(counselor);
  }
}
