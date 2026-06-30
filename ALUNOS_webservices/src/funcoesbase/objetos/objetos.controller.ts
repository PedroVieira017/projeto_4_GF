import { Controller, Get, Query } from '@nestjs/common';
import { ObjetosService } from './objetos.service';

@Controller('objetos')
export class ObjetosController {
	constructor(private readonly objetosService: ObjetosService) {}

	@Get()
	getPrivObjetos(@Query('moduleId') moduleId?: string) {
		return this.objetosService.getPrivObjetos({
			moduleId: moduleId ? Number(moduleId) : 1
		} as any);
	}
}
